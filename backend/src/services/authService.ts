import { prisma, serializeData } from '../database/db.js';
import { hashPassword, comparePassword } from '../utilities/password.js';
import { signToken } from '../utilities/jwt.js';
import { LoginInput } from '../validation/authValidation.js';
import { env } from '../config/env.js';

export class AuthService {
  /**
   * Seed default admin account if none exists
   */
  static async ensureDefaultAdmin() {
    try {
      const adminCount = await prisma.admin.count();
      if (adminCount === 0) {
        const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
        await prisma.admin.create({
          data: {
            email: env.ADMIN_EMAIL,
            passwordHash,
            name: 'Master Repair Admin',
            role: 'ADMIN',
          },
        });
        console.log(`[Seed]: Created default admin: ${env.ADMIN_EMAIL}`);
      }
    } catch (error) {
      console.error('[Seed Error]: Could not verify/seed admin:', error);
    }
  }

  /**
   * Authenticate admin user
   */
  static async login(input: LoginInput) {
    // Ensure default admin exists first if DB is fresh
    await this.ensureDefaultAdmin();

    const admin = await prisma.admin.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!admin) {
      throw { statusCode: 401, message: 'Invalid email or password credentials', code: 'INVALID_CREDENTIALS' };
    }

    const isMatch = await comparePassword(input.password, admin.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid email or password credentials', code: 'INVALID_CREDENTIALS' };
    }

    const token = signToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return {
      token,
      user: serializeData({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      }),
    };
  }

  /**
   * Get current admin profile
   */
  static async getProfile(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw { statusCode: 404, message: 'Admin account not found', code: 'NOT_FOUND' };
    }

    return serializeData(admin);
  }
}
