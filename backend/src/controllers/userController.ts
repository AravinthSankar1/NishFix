import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import {
  registerSchema,
  userLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validation/userValidation.js';
import { sendSuccess } from '../utilities/response.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const result = await UserService.register(input);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, result, 'Account registered successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = userLoginSchema.parse(req.body);
      const result = await UserService.login(input);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, result, 'Logged in successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input = forgotPasswordSchema.parse(req.body);
      const result = await UserService.forgotPassword(input);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input = resetPasswordSchema.parse(req.body);
      const result = await UserService.resetPassword(input);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw { statusCode: 401, message: 'Authentication required', code: 'UNAUTHORIZED' };
      }
      const profile = await UserService.getProfile(req.user.id);
      return sendSuccess(res, profile, 'User profile retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw { statusCode: 401, message: 'Authentication required', code: 'UNAUTHORIZED' };
      }
      const input = updateProfileSchema.parse(req.body);
      const updated = await UserService.updateProfile(req.user.id, input);
      return sendSuccess(res, updated, 'Profile updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return sendSuccess(res, null, 'Logged out successfully');
  }
}
