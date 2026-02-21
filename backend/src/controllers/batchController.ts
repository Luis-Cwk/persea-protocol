import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { batches, users, listings, transactions, custodyRecords } from '../models/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import {
  publicClient,
  contracts,
  getWalletClient,
  getBatchFromChain,
  SKIN_TRACE_ABI,
  SKIN_TRACE_ADDRESS,
} from '../services/blockchain';
import { uploadImage, uploadBatchMetadata, getIpfsUrl } from '../services/ipfs';
import { z } from 'zod';

const registerBatchSchema = z.object({
  residueType: z.enum(['SEED', 'PEEL', 'PULP', 'BIOMASS']),
  weight: z.number().positive(),
  variety: z.string().min(1),
  quality: z.enum(['FRESH', 'PARTIALLY_DEHYDRATED', 'PROCESSED']),
  latitude: z.number(),
  longitude: z.number(),
});

const residueTypeMap: Record<string, number> = {
  SEED: 0,
  PEEL: 1,
  PULP: 2,
  BIOMASS: 3,
};

const qualityMap: Record<string, number> = {
  FRESH: 0,
  PARTIALLY_DEHYDRATED: 1,
  PROCESSED: 2,
};

export async function registerBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { residueType, weight, variety, quality, latitude, longitude } = registerBatchSchema.parse(req.body);
    const producerAddress = req.user?.address as `0x${string}`;
    const privateKey = req.user?.privateKey as `0x${string}`;

    const imageFile = req.file;
    let imageCid = '';
    
    if (imageFile) {
      imageCid = await uploadImage(imageFile.buffer, `batch-${Date.now()}.jpg`);
    }

    const metadataCid = await uploadBatchMetadata({
      residueType,
      weight: weight.toString(),
      variety,
      quality,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      producerAddress,
      imageCid,
    });

    const walletClient = getWalletClient(privateKey);
    
    const txHash = await walletClient.writeContract({
      address: SKIN_TRACE_ADDRESS,
      abi: SKIN_TRACE_ABI,
      functionName: 'registerBatch',
      args: [
        residueTypeMap[residueType],
        BigInt(Math.floor(weight * 1000)),
        variety,
        qualityMap[quality],
        metadataCid,
        BigInt(Math.floor(latitude * 1e6)),
        BigInt(Math.floor(longitude * 1e6)),
      ],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    
    const batchRegisteredEvent = receipt.logs.find((log) => {
      try {
        const decoded = publicClient.decodeEventLog({
          abi: SKIN_TRACE_ABI,
          data: log.data,
          topics: log.topics,
        });
        return decoded.eventName === 'BatchRegistered';
      } catch {
        return false;
      }
    });

    let tokenId = 0;
    if (batchRegisteredEvent) {
      const decoded = publicClient.decodeEventLog({
        abi: SKIN_TRACE_ABI,
        data: batchRegisteredEvent.data,
        topics: batchRegisteredEvent.topics,
      });
      tokenId = Number((decoded.args as any).batchId);
    }

    const producer = await db.query.users.findFirst({
      where: eq(users.address, producerAddress),
    });

    if (producer) {
      await db.insert(batches).values({
        tokenId,
        producerId: producer.id,
        residueType,
        weight: weight.toString(),
        variety,
        quality,
        ipfsHash: metadataCid,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        currentCustodian: producerAddress,
        isListed: false,
        txHash,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        tokenId,
        txHash,
        ipfsUrl: getIpfsUrl(metadataCid),
        imageUrl: imageCid ? getIpfsUrl(imageCid) : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { tokenId } = req.params;
    
    const batch = await db.query.batches.findFirst({
      where: eq(batches.tokenId, parseInt(tokenId)),
      with: {
        producer: true,
      },
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const chainData = await getBatchFromChain(BigInt(tokenId));

    res.json({
      success: true,
      data: {
        ...batch,
        chainData,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listBatches(req: Request, res: Response, next: NextFunction) {
  try {
    const { residueType, minWeight, maxWeight, producerId, limit = '20', offset = '0' } = req.query;

    let query = db.query.batches.findMany({
      with: {
        producer: true,
      },
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      orderBy: [desc(batches.createdAt)],
    });

    const conditions = [];
    
    if (residueType) {
      conditions.push(eq(batches.residueType, residueType as string));
    }
    
    if (producerId) {
      conditions.push(eq(batches.producerId, producerId as string));
    }

    const result = await db.query.batches.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        producer: true,
      },
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      orderBy: [desc(batches.createdAt)],
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function transferCustody(req: Request, res: Response, next: NextFunction) {
  try {
    const { tokenId } = req.params;
    const { newCustodian, location } = req.body;
    const privateKey = req.user?.privateKey as `0x${string}`;

    const walletClient = getWalletClient(privateKey);

    const txHash = await walletClient.writeContract({
      address: SKIN_TRACE_ADDRESS,
      abi: SKIN_TRACE_ABI,
      functionName: 'transferCustody',
      args: [BigInt(tokenId), newCustodian, location],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const batch = await db.query.batches.findFirst({
      where: eq(batches.tokenId, parseInt(tokenId)),
    });

    if (batch) {
      await db.insert(custodyRecords).values({
        batchId: batch.id,
        fromAddress: batch.currentCustodian,
        toAddress: newCustodian,
        location,
        txHash,
      });

      await db.update(batches)
        .set({ currentCustodian: newCustodian, updatedAt: new Date() })
        .where(eq(batches.tokenId, parseInt(tokenId)));
    }

    res.json({
      success: true,
      data: { txHash },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustodyHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { tokenId } = req.params;

    const batch = await db.query.batches.findFirst({
      where: eq(batches.tokenId, parseInt(tokenId)),
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const history = await db.query.custodyRecords.findMany({
      where: eq(custodyRecords.batchId, batch.id),
      orderBy: [desc(custodyRecords.createdAt)],
    });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
}
