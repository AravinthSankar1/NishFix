import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/repair_software_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-12345!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Cloudflare R2 Credentials (S3 Compatible API)
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'mobile-repair-software',
  R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL || '',
  
  // Storage Quota Limit (Default 10 GB for Free Tier awareness)
  FREE_TIER_STORAGE_LIMIT_BYTES: parseInt(
    process.env.FREE_TIER_STORAGE_LIMIT_BYTES || '10737418240',
    10
  ),
  
  // Default Admin Credentials for automatic seeding
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@repair.local',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminPass123!',
};
