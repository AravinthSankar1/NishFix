import { prisma, serializeData } from '../database/db.js';
import {
  CreateSoftwareInput,
  UpdateSoftwareInput,
  QuerySoftwareInput,
} from '../validation/softwareValidation.js';
import { StorageService } from './storageService.js';
import { SoftwareStatus } from '@prisma/client';

export class SoftwareService {
  static async listSoftware(query: QuerySoftwareInput, isPublic: boolean = true) {
    const {
      search,
      brand,
      model,
      category,
      subCategory,
      status,
      page = 1,
      limit = 24,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (isPublic) {
      where.status = SoftwareStatus.PUBLISHED;
    } else if (status && status !== 'ALL') {
      where.status = status as SoftwareStatus;
    }

    if (subCategory && subCategory !== 'ALL') {
      where.subCategory = { equals: subCategory, mode: 'insensitive' };
    }

    if (brand && brand !== 'ALL') {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (model) {
      where.model = { contains: model, mode: 'insensitive' };
    }

    if (category && category !== 'ALL') {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { brand: { contains: searchTerm, mode: 'insensitive' } },
        { model: { contains: searchTerm, mode: 'insensitive' } },
        { softwareName: { contains: searchTerm, mode: 'insensitive' } },
        { subCategory: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
        { compatibility: { contains: searchTerm, mode: 'insensitive' } },
        { version: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { uploaderName: { contains: searchTerm, mode: 'insensitive' } },
        { originalFileName: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [items, totalCount] = await Promise.all([
      prisma.software.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          uploadedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.software.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      items: serializeData(items),
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getSoftwareById(id: string, isPublic: boolean = true) {
    const software = await prisma.software.findUnique({
      where: { id },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!software) {
      throw { statusCode: 404, message: 'Software entry not found', code: 'NOT_FOUND' };
    }

    if (isPublic && software.status !== SoftwareStatus.PUBLISHED) {
      throw {
        statusCode: 404,
        message: 'Software entry is not available',
        code: 'NOT_FOUND',
      };
    }

    return serializeData(software);
  }

  static async createSoftware(data: CreateSoftwareInput, userId?: string) {
    const software = await prisma.software.create({
      data: {
        brand: data.brand.trim(),
        model: data.model.trim(),
        softwareName: data.softwareName.trim(),
        version: data.version.trim(),
        description: data.description || null,
        additionalInfo: data.additionalInfo || null,
        category: data.category || 'Firmware & Tools',
        subCategory: data.subCategory || 'Mobile Phone',
        tags: data.tags || null,
        compatibility: data.compatibility || null,
        uploaderName: data.uploaderName || 'Official Lab',
        imageObjectKey: data.imageObjectKey || null,
        imageUrl: data.imageUrl || null,
        fileObjectKey: data.fileObjectKey || 'url-download',
        originalFileName: data.originalFileName || `${data.softwareName.replace(/\s+/g, '-')}-${data.version}.zip`,
        fileSize: BigInt(data.fileSize || 0),
        mimeType: data.mimeType || 'application/zip',
        checksum: data.checksum || null,
        externalUrl: data.externalUrl || null,
        status: (data.status as SoftwareStatus) || SoftwareStatus.PUBLISHED,
        uploadedByUserId: userId || data.uploadedByUserId || null,
      },
    });

    return serializeData(software);
  }

  static async updateSoftware(id: string, data: UpdateSoftwareInput) {
    const existing = await prisma.software.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Software entry not found', code: 'NOT_FOUND' };
    }

    const updated = await prisma.software.update({
      where: { id },
      data: {
        ...(data.brand && { brand: data.brand.trim() }),
        ...(data.model && { model: data.model.trim() }),
        ...(data.softwareName && { softwareName: data.softwareName.trim() }),
        ...(data.version && { version: data.version.trim() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.additionalInfo !== undefined && { additionalInfo: data.additionalInfo }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.subCategory !== undefined && { subCategory: data.subCategory }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.compatibility !== undefined && { compatibility: data.compatibility }),
        ...(data.uploaderName !== undefined && { uploaderName: data.uploaderName }),
        ...(data.imageObjectKey !== undefined && { imageObjectKey: data.imageObjectKey }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.fileObjectKey !== undefined && { fileObjectKey: data.fileObjectKey }),
        ...(data.originalFileName !== undefined && { originalFileName: data.originalFileName }),
        ...(data.fileSize !== undefined && { fileSize: BigInt(data.fileSize) }),
        ...(data.mimeType !== undefined && { mimeType: data.mimeType }),
        ...(data.checksum !== undefined && { checksum: data.checksum }),
        ...(data.externalUrl !== undefined && { externalUrl: data.externalUrl }),
        ...(data.status && { status: data.status as SoftwareStatus }),
      },
    });

    return serializeData(updated);
  }

  static async changeStatus(id: string, status: SoftwareStatus) {
    const software = await prisma.software.update({
      where: { id },
      data: { status },
    });
    return serializeData(software);
  }

  static async deleteSoftware(id: string) {
    const existing = await prisma.software.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Software entry not found', code: 'NOT_FOUND' };
    }

    await prisma.software.delete({ where: { id } });

    return { id, message: 'Software entry deleted successfully.' };
  }

  static async getBrands(subCategory?: string) {
    const where: any = { status: SoftwareStatus.PUBLISHED };
    if (subCategory && subCategory !== 'ALL') {
      where.subCategory = { equals: subCategory, mode: 'insensitive' };
    }

    const brands = await prisma.software.groupBy({
      by: ['brand'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return brands.map((b) => ({
      brand: b.brand,
      count: b._count.id,
    }));
  }

  static async getDataWorksStructure() {
    // Get subCategory and brand counts for Borneo DataWorks navigation
    const subCategories = ['Mobile Phone', 'Laptop', 'EMMC FILE', 'UFS FILE', 'SPECIAL FILE', 'PC'];

    const items = await prisma.software.findMany({
      where: { status: SoftwareStatus.PUBLISHED },
      select: {
        id: true,
        brand: true,
        subCategory: true,
        category: true,
        softwareName: true,
      },
    });

    const structure: Record<string, { brand: string; count: number; categoryType?: string }[]> = {};

    subCategories.forEach((sc) => {
      structure[sc] = [];
    });

    // Group by subCategory and brand
    const map: Record<string, Map<string, { count: number; categoryType: string }>> = {};
    subCategories.forEach((sc) => {
      map[sc] = new Map();
    });

    items.forEach((item) => {
      const sc = item.subCategory || 'Mobile Phone';
      if (!map[sc]) map[sc] = new Map();
      const brand = item.brand.toUpperCase();
      const existing = map[sc].get(brand) || { count: 0, categoryType: item.category || 'Firmware' };
      existing.count += 1;
      map[sc].set(brand, existing);
    });

    Object.keys(map).forEach((sc) => {
      structure[sc] = Array.from(map[sc].entries()).map(([brand, val]) => ({
        brand,
        count: val.count,
        categoryType: val.categoryType,
      })).sort((a, b) => a.brand.localeCompare(b.brand));
    });

    return structure;
  }

  static async getDashboardStats() {
    const [
      totalSoftware,
      publishedCount,
      draftCount,
      archivedCount,
      downloadStats,
      brandsGroup,
      storageStats,
    ] = await Promise.all([
      prisma.software.count(),
      prisma.software.count({ where: { status: SoftwareStatus.PUBLISHED } }),
      prisma.software.count({ where: { status: SoftwareStatus.DRAFT } }),
      prisma.software.count({ where: { status: SoftwareStatus.ARCHIVED } }),
      prisma.software.aggregate({ _sum: { downloadCount: true } }),
      prisma.software.groupBy({ by: ['brand'] }),
      StorageService.getStorageStats(),
    ]);

    return {
      totalSoftware,
      publishedCount,
      draftCount,
      archivedCount,
      totalDownloads: downloadStats._sum.downloadCount || 0,
      totalBrands: brandsGroup.length,
      storage: storageStats,
    };
  }
}
