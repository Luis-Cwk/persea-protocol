import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, userScores, carbonCredits, consents } from '../models/schema';
import { eq } from 'drizzle-orm';
import {
  getWalletClient,
  SEED_SCORE_ADDRESS,
  SEED_SCORE_ABI,
  SEED_CONSENT_ADDRESS,
  SEED_CONSENT_ABI,
  getGreenScoreFromChain,
  getProducerScoreFromChain,
  publicClient,
} from '../services/blockchain';
import { z } from 'zod';

const updateConsentSchema = z.object({
  dataSharingAllowed: z.boolean(),
  aggregatedDataAllowed: z.boolean(),
  purpose: z.string().optional(),
});

export async function getUserProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const address = req.params.address || req.user?.address;

    const user = await db.query.users.findFirst({
      where: eq(users.address, address),
      with: {
        userScores: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const chainScore = await getProducerScoreFromChain(address as `0x${string}`);
    const greenScore = await getGreenScoreFromChain(address as `0x${string}`);

    res.json({
      success: true,
      data: {
        ...user,
        chainScore,
        greenScore,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserBatches(req: Request, res: Response, next: NextFunction) {
  try {
    const { address } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const user = await db.query.users.findFirst({
      where: eq(users.address, address),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const batches = await db.query.batches.findMany({
      where: eq(batches.producerId, user.id),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      orderBy: [desc(batches.createdAt)],
    });

    res.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserCarbonCredits(req: Request, res: Response, next: NextFunction) {
  try {
    const { address } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.address, address),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const credits = await db.query.carbonCredits.findMany({
      where: eq(carbonCredits.ownerId, user.id),
    });

    res.json({
      success: true,
      data: credits,
    });
  } catch (error) {
    next(error);
  }
}

export async function claimCarbonCredit(req: Request, res: Response, next: NextFunction) {
  try {
    const { creditId } = req.params;
    const privateKey = req.user?.privateKey as `0x${string}`;

    const walletClient = getWalletClient(privateKey);

    const txHash = await walletClient.writeContract({
      address: SEED_SCORE_ADDRESS,
      abi: SEED_SCORE_ABI,
      functionName: 'claimCarbonCredit',
      args: [BigInt(creditId)],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    await db.update(carbonCredits)
      .set({ claimed: true })
      .where(eq(carbonCredits.creditId, parseInt(creditId)));

    res.json({
      success: true,
      data: { txHash },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateConsent(req: Request, res: Response, next: NextFunction) {
  try {
    const { dataSharingAllowed, aggregatedDataAllowed, purpose } = updateConsentSchema.parse(req.body);
    const privateKey = req.user?.privateKey as `0x${string}`;
    const address = req.user?.address;

    const walletClient = getWalletClient(privateKey);

    const txHash = await walletClient.writeContract({
      address: SEED_CONSENT_ADDRESS,
      abi: SEED_CONSENT_ABI,
      functionName: 'giveConsent',
      args: [dataSharingAllowed, aggregatedDataAllowed, purpose || 'marketplace'],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const user = await db.query.users.findFirst({
      where: eq(users.address, address),
    });

    if (user) {
      const existingConsent = await db.query.consents.findFirst({
        where: eq(consents.producerId, user.id),
      });

      if (existingConsent) {
        await db.update(consents)
          .set({
            dataSharingAllowed,
            aggregatedDataAllowed,
            purpose,
            txHash,
          })
          .where(eq(consents.id, existingConsent.id));
      } else {
        await db.insert(consents).values({
          producerId: user.id,
          dataSharingAllowed,
          aggregatedDataAllowed,
          purpose,
          txHash,
        });
      }
    }

    res.json({
      success: true,
      data: { txHash },
    });
  } catch (error) {
    next(error);
  }
}

export async function revokeConsent(req: Request, res: Response, next: NextFunction) {
  try {
    const privateKey = req.user?.privateKey as `0x${string}`;
    const address = req.user?.address;

    const walletClient = getWalletClient(privateKey);

    const txHash = await walletClient.writeContract({
      address: SEED_CONSENT_ADDRESS,
      abi: SEED_CONSENT_ABI,
      functionName: 'revokeConsent',
      args: [],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const user = await db.query.users.findFirst({
      where: eq(users.address, address),
    });

    if (user) {
      await db.update(consents)
        .set({
          dataSharingAllowed: false,
          aggregatedDataAllowed: false,
        })
        .where(eq(consents.producerId, user.id));
    }

    res.json({
      success: true,
      data: { txHash },
    });
  } catch (error) {
    next(error);
  }
}

export async function getGreenScore(req: Request, res: Response, next: NextFunction) {
  try {
    const { address } = req.params;

    const greenScore = await getGreenScoreFromChain(address as `0x${string}`);
    const producerScore = await getProducerScoreFromChain(address as `0x${string}`);

    res.json({
      success: true,
      data: {
        greenScore: Number(greenScore),
        producerScore,
      },
    });
  } catch (error) {
    next(error);
  }
}

import { batches } from '../models/schema';
import { desc } from 'drizzle-orm';
