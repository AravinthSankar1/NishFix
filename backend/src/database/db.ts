import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Helper to convert Prisma objects with BigInt fields to plain JSON-serializable objects
export const serializeData = <T>(data: T): any => {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )
  );
};
