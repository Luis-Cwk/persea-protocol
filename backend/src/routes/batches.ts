import { Router } from 'express';
import multer from 'multer';
import {
  registerBatch,
  getBatch,
  listBatches,
  transferCustody,
  getCustodyHistory,
} from '../controllers/batchController';
import { authWithPrivateKey, authMiddleware } from '../middleware/auth';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.post(
  '/register',
  authWithPrivateKey,
  upload.single('image'),
  registerBatch
);

router.get('/', authMiddleware, listBatches);
router.get('/:tokenId', authMiddleware, getBatch);
router.post('/:tokenId/transfer', authWithPrivateKey, transferCustody);
router.get('/:tokenId/custody', authMiddleware, getCustodyHistory);

export default router;
