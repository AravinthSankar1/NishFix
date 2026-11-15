import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/userAuthMiddleware.js';

const router = Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.post('/logout', UserController.logout);
router.get('/me', authenticateUser, UserController.getProfile);
router.put('/me', authenticateUser, UserController.updateProfile);

export default router;
