import { Router } from 'express';
import {
  createListing,
  getListings,
  getListing,
  makeOffer,
  acceptOffer,
  confirmDelivery,
  cancelListing,
} from '../controllers/marketController';
import { authWithPrivateKey, authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authWithPrivateKey, createListing);
router.get('/', authMiddleware, getListings);
router.get('/:listingId', authMiddleware, getListing);
router.post('/offer', authWithPrivateKey, makeOffer);
router.post('/:listingId/accept/:offerIndex', authWithPrivateKey, acceptOffer);
router.post('/confirm-delivery', authWithPrivateKey, confirmDelivery);
router.delete('/:listingId', authWithPrivateKey, cancelListing);

export default router;
