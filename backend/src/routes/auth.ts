import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, apiKeys } from '../models/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  address: z.string().startsWith('0x'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  signature: z.string(),
  message: z.string(),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { address, email, phone, name, signature, message } = registerSchema.parse(req.body);

    let user = await db.query.users.findFirst({
      where: eq(users.address, address),
    });

    if (!user) {
      const [newUser] = await db.insert(users).values({
        address,
        email,
        phone,
        name,
        role: 'producer',
      }).returning();
      user = newUser;
    }

    const token = generateToken({
      id: user.id,
      address: user.address,
      email: user.email || undefined,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          address: user.address,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.address, address),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = generateToken({
      id: user.id,
      address: user.address,
      email: user.email || undefined,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          address: user.address,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/api-keys', async (req: Request, res: Response) => {
  try {
    const { userId, name, permissions } = req.body;

    const key = uuidv4().replace(/-/g, '');

    const [apiKey] = await db.insert(apiKeys).values({
      userId,
      key,
      name,
      permissions,
    }).returning();

    res.status(201).json({
      success: true,
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key,
      },
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/api-keys/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const keys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.userId, userId),
    });

    res.json({
      success: true,
      data: keys.map((k) => ({
        id: k.id,
        name: k.name,
        key: k.key.slice(0, 8) + '...',
        lastUsed: k.lastUsed,
        createdAt: k.createdAt,
      })),
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.delete('/api-keys/:keyId', async (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;

    await db.delete(apiKeys).where(eq(apiKeys.id, keyId));

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
