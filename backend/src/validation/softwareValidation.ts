import { z } from 'zod';

export const createSoftwareSchema = z.object({
  brand: z.string().min(1, 'Brand is required (e.g. Samsung, Xiaomi)'),
  model: z.string().min(1, 'Mobile model is required (e.g. Galaxy A15)'),
  softwareName: z.string().min(1, 'Software name is required (e.g. Odin Flash Tool)'),
  version: z.string().min(1, 'Version is required (e.g. 1.2.0)'),
  description: z.string().optional(),
  additionalInfo: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  compatibility: z.string().optional(),
  imageObjectKey: z.string().optional(),
  imageUrl: z.string().optional(),
  fileObjectKey: z.string().optional(),
  originalFileName: z.string().optional(),
  fileSize: z.number().optional().default(0),
  mimeType: z.string().default('application/zip'),
  checksum: z.string().optional(),
  externalUrl: z.string().url('Download URL must be a valid HTTP/HTTPS link').optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export const updateSoftwareSchema = createSoftwareSchema.partial();

export const querySoftwareSchema = z.object({
  search: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ALL']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  sortBy: z.enum(['createdAt', 'downloadCount', 'brand', 'softwareName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const uploadUrlSchema = z.object({
  fileType: z.enum(['image', 'zip']),
  fileName: z.string().min(1, 'File name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileSize: z.number().positive('File size must be positive'),
  softwareId: z.string().optional(),
});

export type CreateSoftwareInput = z.infer<typeof createSoftwareSchema>;
export type UpdateSoftwareInput = z.infer<typeof updateSoftwareSchema>;
export type QuerySoftwareInput = z.infer<typeof querySoftwareSchema>;
export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
