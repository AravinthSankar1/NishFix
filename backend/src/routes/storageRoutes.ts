import { Router } from 'express';
import { StorageController } from '../controllers/storageController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Presigned URL generation for uploads (Admin only)
router.post('/presigned-url', authenticateAdmin, StorageController.getPresignedUploadUrl);
router.post('/image-url', authenticateAdmin, StorageController.getPresignedUploadUrl);
router.post('/software-url', authenticateAdmin, StorageController.getPresignedUploadUrl);

// Storage stats (Admin only)
router.get('/stats', authenticateAdmin, StorageController.getStorageStats);

// Mock storage fallbacks for local dev / testing
router.put('/mock-upload', StorageController.mockUploadHandler);
router.get('/mock-download', StorageController.mockDownloadHandler);

export default router;
