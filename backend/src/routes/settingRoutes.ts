import { Router } from 'express';
import { SettingController } from '../controllers/settingController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Public: View current hero image
router.get('/hero-image', SettingController.getHeroImage);

// Admin only: Update hero image (uploads to Google Drive "Hero Photos" folder)
router.post(
  '/hero-image',
  authenticateAdmin,
  upload.single('image'),
  SettingController.updateHeroImage
);

export default router;
