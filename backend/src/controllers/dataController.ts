import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { batches, users, transactions } from '../models/schema';
import { sql, and, gte, lte, eq } from 'drizzle-orm';
import { z } from 'zod';

const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  municipality: z.string().optional(),
});

export async function getAggregatedData(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate, municipality } = dateRangeSchema.parse(req.query);

    const conditions = [];
    
    if (startDate) {
      conditions.push(gte(batches.createdAt, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(batches.createdAt, new Date(endDate)));
    }

    const volumeByType = await db
      .select({
        residueType: batches.residueType,
        totalWeight: sql<string>`SUM(${batches.weight})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(batches)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(batches.residueType);

    const volumeByVariety = await db
      .select({
        variety: batches.variety,
        totalWeight: sql<string>`SUM(${batches.weight})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(batches)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(batches.variety);

    const avgQualityByType = await db
      .select({
        residueType: batches.residueType,
        quality: batches.quality,
        count: sql<number>`COUNT(*)`,
      })
      .from(batches)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(batches.residueType, batches.quality);

    const totalTransactions = await db
      .select({
        totalVolume: sql<string>`SUM(${transactions.weight})`,
        totalValue: sql<string>`SUM(${transactions.totalPrice})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json({
      success: true,
      data: {
        volumeByType,
        volumeByVariety,
        avgQualityByType,
        totalTransactions: totalTransactions[0],
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMarketPrices(req: Request, res: Response, next: NextFunction) {
  try {
    const prices = await db
      .select({
        residueType: batches.residueType,
        avgPricePerKg: sql<string>`AVG(${listings.pricePerKg})`,
        minPrice: sql<string>`MIN(${listings.pricePerKg})`,
        maxPrice: sql<string>`MAX(${listings.pricePerKg})`,
      })
      .from(listings)
      .innerJoin(batches, eq(listings.batchId, batches.id))
      .where(eq(listings.active, true))
      .groupBy(batches.residueType);

    res.json({
      success: true,
      data: prices,
    });
  } catch (error) {
    next(error);
  }
}

import { listings } from '../models/schema';
