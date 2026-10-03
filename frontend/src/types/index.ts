export type SoftwareStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Software {
  id: string;
  brand: string;
  model: string;
  softwareName: string;
  version: string;
  description?: string | null;
  additionalInfo?: string | null;
  category?: string | null;
  tags?: string | null;
  compatibility?: string | null;
  imageObjectKey?: string | null;
  imageUrl?: string | null;
  fileObjectKey: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  checksum?: string | null;
  externalUrl?: string | null;
  downloadCount: number;
  status: SoftwareStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPERADMIN';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  code?: string;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SoftwareListResponse {
  items: Software[];
  pagination: Pagination;
}

export interface BrandFilter {
  brand: string;
  count: number;
}

export interface StorageStats {
  totalFiles: number;
  totalUsedBytes: number;
  totalUsedGB: string;
  limitBytes: number;
  limitGB: string;
  percentageUsed: number;
  isR2Configured: boolean;
  bucketName: string;
}

export interface DashboardStats {
  totalSoftware: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  totalDownloads: number;
  totalBrands: number;
  storage: StorageStats;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  objectKey: string;
  isMock: boolean;
  fileName: string;
  fileType: 'image' | 'zip';
}

export interface PresignedDownloadResponse {
  downloadUrl: string;
  isMock: boolean;
  fileName: string;
  softwareName: string;
  version: string;
}
