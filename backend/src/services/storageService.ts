import { prisma } from '../database/db.js';
import { UploadUrlInput } from '../validation/softwareValidation.js';

export class StorageService {
  /**
   * Request upload URL placeholder (URL based storage)
   */
  static async requestUploadUrl(input: UploadUrlInput) {
    const { fileName, fileType } = input;
    return {
      uploadUrl: '',
      objectKey: `url-${Date.now()}`,
      isMock: true,
      fileName,
      fileType,
    };
  }

  /**
   * Request direct download URL for software
   */
  static async requestDownloadUrl(softwareId: string, reqIp?: string, reqUserAgent?: string) {
    const software = await prisma.software.findUnique({
      where: { id: softwareId },
    });

    if (!software) {
      throw {
        statusCode: 404,
        message: 'Software entry not found',
        code: 'NOT_FOUND',
      };
    }

    if (software.status !== 'PUBLISHED') {
      throw {
        statusCode: 403,
        message: 'This software is not currently published for download.',
        code: 'FORBIDDEN',
      };
    }

    // Increment download count and create download log
    await prisma.$transaction([
      prisma.software.update({
        where: { id: softwareId },
        data: { downloadCount: { increment: 1 } },
      }),
      prisma.downloadLog.create({
        data: {
          softwareId,
          ipAddress: reqIp || null,
          userAgent: reqUserAgent || null,
        },
      }),
    ]);

    const targetUrl = software.externalUrl || software.imageUrl || '#';

    return {
      downloadUrl: targetUrl,
      isMock: false,
      fileName: software.originalFileName || `${software.softwareName}.zip`,
      softwareName: software.softwareName,
      version: software.version,
    };
  }

  /**
   * Get storage stats summary
   */
  static async getStorageStats() {
    const count = await prisma.software.count();

    return {
      totalFiles: count,
      totalUsedBytes: 0,
      totalUsedGB: '0.000',
      limitBytes: 0,
      limitGB: '0.0',
      percentageUsed: 0,
      isR2Configured: false,
      bucketName: 'URL Mirror Library',
    };
  }
}
