import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { batches, users, listings, transactions } from '../models/schema';
import { eq, and, desc } from 'drizzle-orm';
import {
  publicClient,
  getWalletClient,
  PIT_MARKET_ADDRESS,
  PIT_MARKET_ABI,
  getListingFromChain,
} from '../services/blockchain';
import { z } from 'zod';

const createListingSchema = z.object({
  batchId: z.number().int(),
  pricePerKg: z.string(),
  paymentToken: z.string().startsWith('0x'),
});

const makeOfferSchema = z.object({
  listingId: z.number().int(),
  weight: z.number().positive(),
});

const confirmDeliverySchema = z.object({
  listingId: z.number().int(),
  offerIndex: z.number().int(),
  latitude: z.number(),
  longitude: z.number(),
});

export async function createListing(req: Request, res: Response, next: NextFunction) {
  try {
    const { batchId, pricePerKg, paymentToken } = createListingSchema.parse(req.body);
    const privateKey = req.user?.privateKey as `0x${string}`;

    const batch = await db.query.batches.findFirst({
      where: eq(batches.tokenId, batchId),
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const walletClient = getWalletClient(privateKey);

    const txHash = await walletClient.writeContract({
      address: PIT_MARKET_ADDRESS,
      abi: PIT_MARKET_ABI,
      functionName: 'createListing',
      args: [BigInt(batchId), BigInt(pricePerKg), paymentToken],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    let listingId = 0;
    const listingCreatedEvent = receipt.logs.find((log) => {
      try {
        const decoded = publicClient.decodeEventLog({
          abi: PIT_MARKET_ABI,
          data: log.data,
          topics: log.topics,
        });
        return decoded.eventName === 'ListingCreated';
      } catch {
        return false;
      }
    });

    if (listingCreatedEvent) {
      const decoded = publicClient.decodeEventLog({
        abi: PIT_MARKET_ABI,
        data: listingCreatedEvent.data,
        topics: listingCreatedEvent.topics,
      });
      listingId = Number((decoded.args as any).listingId);
    }

    const seller = await db.query.users.findFirst({
      where: eq(users.address, req.user?.address || ''),
    });

    if (seller) {
      await db.insert(listings).values({
        listingId,
        batchId: batch.id,
        sellerId: seller.id,
        pricePerKg,
        availableWeight: batch.weight,
        paymentToken,
        active: true,
        txHash,
      });

      await db.update(batches)
        .set({ isListed: true })
        .where(eq(batches.tokenId, batchId));
    }

    res.status(201).json({
      success: true,
      data: {
        listingId,
        txHash,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getListings(req: Request, res: Response, next: NextFunction) {
  try {
    const { residueType, active, limit = '20', offset = '0' } = req.query;

    const conditions = [];
    
    if (active === 'true') {
      conditions.push(eq(listings.active, true));
    }

    const result = await db.query.listings.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        batch: {
          with: {
            producer: true,
          },
        },
        seller: true,
      },
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      orderBy: [desc(listings.createdAt)],
    });

    const filteredResult = residueType
      ? result.filter((l) => l.batch?.residueType === residueType)
      : result;

    res.json({
      success: true,
      data: filteredResult,
    });
  } catch (error) {
    next(error);
  }
}

export async function getListing(req: Request, res: Response, next: NextFunction) {
  try {
    const { listingId } = req.params;

    const listing = await db.query.listings.findFirst({
      where: eq(listings.listingId, parseInt(listingId)),
      with: {
        batch: {
          with: {
            producer: true,
          },
        },
        seller: true,
      },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const chainData = await getListingFromChain(BigInt(listingId));

    res.json({
      success: true,
      data: {
        ...listing,
        chainData,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function makeOffer(req: Request, res: Response, next: NextFunction) {
  try {
    const { listingId, weight } = makeOfferSchema.parse(req.body);
    const privateKey = req.user?.privateKey as `0x${string}`;

    const walletClient = getWalletClient(privateKey);

    const txHash = await walletClient.writeContract({
      address: PIT_MARKET_ADDRESS,
      abi: PIT_MARKET_ABI,
      functionName: 'makeOffer',
      args: [BigInt(listingId), BigInt(Math.floor(weight * 1000))],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    res.status(201).json({
      success: true,
      data: { txHash },
    });
  } catch (error) {
    next(error);
  }
}

export async function acceptOffer(req: Request, res: Response, next: NextFunction) {
  try {
    const { listingId, offerIndex } = req.params;
    const privateKey = req.user?.privateKey as `0x${string}`;

    const walletClient = getWalletClient(privateKey);

    const txHash = await walletClient.writeContract({
      address: PIT_MARKET_ADDRESS,
      abi: PIT_MARKET_ABI,
      functionName: 'acceptOffer',
      args: [BigInt(listingId), BigInt(offerIndex)],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    res.json({
      success: true,
      data: { txHash },
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmDelivery(req: Request, res: Response, next: NextFunction) {
  try {
    const { listingId, offerIndex, latitude, longitude } = confirmDeliverySchema.parse(req.body);
    const privateKey = req.user?.privateKey as `0x${string}`;

    const walletClient = getWalletClient(privateKey);

    const deliveryProof = `0x${Buffer.from(
      JSON.stringify({
        lat: latitude,
        lng: longitude,
        timestamp: Date.now(),
      })
    ).toString('hex')}`;

    const txHash = await walletClient.writeContract({
      address: PIT_MARKET_ADDRESS,
      abi: PIT_MARKET_ABI,
      functionName: 'confirmDelivery',
      args: [
        BigInt(listingId),
        BigInt(offerIndex),
        deliveryProof as `0x${string}`,
        BigInt(Math.floor(latitude * 1e6)),
        BigInt(Math.floor(longitude * 1e6)),
      ],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    res.json({
      success: true,
      data: { txHash, deliveryProof },
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelListing(req: Request, res: Response, next: NextFunction) {
  try {
    const { listingId } = req.params;
    const privateKey = req.user?.privateKey as `0x${string}`;

    const walletClient = getWalletClient(privateKey);

    const txHash = await walletClient.writeContract({
      address: PIT_MARKET_ADDRESS,
      abi: PIT_MARKET_ABI,
      functionName: 'cancelListing',
      args: [BigInt(listingId)],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    await db.update(listings)
      .set({ active: false })
      .where(eq(listings.listingId, parseInt(listingId)));

    res.json({
      success: true,
      data: { txHash },
    });
  } catch (error) {
    next(error);
  }
}
