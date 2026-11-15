import crypto from 'crypto';
import { prisma, serializeData } from '../database/db.js';
import { hashPassword, comparePassword } from '../utilities/password.js';
import { signToken } from '../utilities/jwt.js';
import {
  RegisterInput,
  UserLoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from '../validation/userValidation.js';

export class UserService {
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existing) {
      throw {
        statusCode: 409,
        message: 'An account with this email address already exists. Please log in.',
        code: 'USER_EXISTS',
      };
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: input.email.toLowerCase().trim(),
        phone: input.phone?.trim() || null,
        passwordHash,
        deviceLimit: 2,
        credits: 100,
        role: 'USER',
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: serializeData({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        deviceLimit: user.deviceLimit,
        credits: user.credits,
        createdAt: user.createdAt,
      }),
    };
  }

  static async login(input: UserLoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!user) {
      throw {
        statusCode: 401,
        message: 'Invalid email or password credentials',
        code: 'INVALID_CREDENTIALS',
      };
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw {
        statusCode: 401,
        message: 'Invalid email or password credentials',
        code: 'INVALID_CREDENTIALS',
      };
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: serializeData({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        deviceLimit: user.deviceLimit,
        credits: user.credits,
        createdAt: user.createdAt,
      }),
    };
  }

  static async forgotPassword(input: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!user) {
      // Return success-like response for security to not leak registered emails, but include note
      return {
        message: 'If that email address is in our database, a password reset link/token has been generated.',
        resetToken: null,
      };
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(24).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      },
    });

    return {
      message: 'Password reset token generated successfully. Use this token to reset your password.',
      resetToken, // Returned in response for immediate use without an external SMTP requirement
      expiresAt: resetPasswordExpires,
    };
  }

  static async resetPassword(input: ResetPasswordInput) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: input.token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw {
        statusCode: 400,
        message: 'Password reset token is invalid or has expired. Please request a new one.',
        code: 'INVALID_RESET_TOKEN',
      };
    }

    const passwordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return {
      message: 'Your password has been successfully reset! You can now log in with your new credentials.',
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        deviceLimit: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User account not found', code: 'NOT_FOUND' };
    }

    return serializeData(user);
  }

  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw { statusCode: 404, message: 'User not found', code: 'NOT_FOUND' };
    }

    const data: any = {};
    if (input.name) data.name = input.name.trim();
    if (input.phone !== undefined) data.phone = input.phone?.trim() || null;

    if (input.newPassword) {
      if (!input.currentPassword) {
        throw { statusCode: 400, message: 'Current password is required to set a new password', code: 'MISSING_PASSWORD' };
      }
      const isMatch = await comparePassword(input.currentPassword, user.passwordHash);
      if (!isMatch) {
        throw { statusCode: 400, message: 'Current password is incorrect', code: 'INCORRECT_PASSWORD' };
      }
      data.passwordHash = await hashPassword(input.newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        deviceLimit: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return serializeData(updated);
  }
}
