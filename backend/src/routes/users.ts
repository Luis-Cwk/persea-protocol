import { Router } from 'express';
import {
  getUserProfile,
  getUserBatches,
  getUserCarbonCredits,
  claimCarbonCredit,
  updateConsent,
  revokeConsent,
  getGreenScore,
} from '../controllers/userController';
import { authWithPrivateKey, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/profile/:address?', authMiddleware, getUserProfile);
router.get('/:address/batches', authMiddleware, getUserBatches);
router.get('/:address/carbon-credits', authMiddleware, getUserCarbonCredits);
router.post('/carbon-credits/:creditId/claim', authWithPrivateKey, claimCarbonCredit);
router.post('/consent', authWithPrivateKey, updateConsent);
router.delete('/consent', authWithPrivateKey, revokeConsent);
router.get('/:address/green-score', authMiddleware, getGreenScore);

export default router;
