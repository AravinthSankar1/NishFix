import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { loginSchema } from '../validation/authValidation.js';
import { sendSuccess } from '../utilities/response.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedInput);

      // Set HttpOnly cookie for security (and return token in JSON)
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(res, result, 'Logged in successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return sendSuccess(res, null, 'Logged out successfully');
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw { statusCode: 401, message: 'Not authenticated', code: 'UNAUTHORIZED' };
      }
      const profile = await AuthService.getProfile(req.user.id);
      return sendSuccess(res, profile, 'Profile retrieved');
    } catch (error) {
      return next(error);
    }
  }
}
