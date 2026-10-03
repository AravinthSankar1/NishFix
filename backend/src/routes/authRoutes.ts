import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authenticateAdmin, AuthController.me);

export default router;
