import { Router } from 'express';
import { StorageController } from '../controllers/storageController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Google Drive Direct Upload endpoint (Multipart file)
router.post('/upload-drive', upload.single('file'), StorageController.uploadToGoogleDriveHandler);

// Google Drive 1-Click OAuth Connect
router.get('/gdrive-auth', StorageController.getGoogleAuthUrl);
router.get('/gdrive-callback', StorageController.handleGoogleAuthCallback);

// Google Drive Integration Status
router.get('/gdrive-status', StorageController.getGoogleDriveStatus);

// Local File Upload endpoint (Accepts multipart/form-data 'file')
router.post('/upload', upload.single('file'), StorageController.uploadFileHandler);

// Presigned URL generation for uploads (R2 fallback)
router.post('/presigned-url', StorageController.getPresignedUploadUrl);
router.post('/image-url', StorageController.getPresignedUploadUrl);
router.post('/software-url', StorageController.getPresignedUploadUrl);

// Storage stats
router.get('/stats', StorageController.getStorageStats);

// Fallbacks for direct local download
router.put('/mock-upload', StorageController.mockUploadHandler);
router.get('/mock-download', StorageController.mockDownloadHandler);

export default router;
