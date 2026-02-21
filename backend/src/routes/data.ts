import { Router } from 'express';
import { getAggregatedData, getMarketPrices } from '../controllers/dataController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/aggregated', authMiddleware, getAggregatedData);
router.get('/prices', authMiddleware, getMarketPrices);

export default router;
