import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../services/storageService.js';
import { uploadUrlSchema } from '../validation/softwareValidation.js';
import { sendSuccess, sendError } from '../utilities/response.js';

export class StorageController {
  /**
   * Request a secure presigned upload URL for direct browser-to-R2 upload
   */
  static async getPresignedUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const input = uploadUrlSchema.parse(req.body);
      const result = await StorageService.requestUploadUrl(input);
      return sendSuccess(res, result, 'Presigned upload URL generated successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Mock endpoint to accept direct local uploads if R2 is not configured
   */
  static async mockUploadHandler(req: Request, res: Response) {
    const { key } = req.query;
    console.log(`[Mock R2 Storage]: Received simulated upload for object key: ${key}`);
    return res.status(200).json({
      success: true,
      message: 'Mock file upload simulated successfully',
      key,
    });
  }

  /**
   * Mock download endpoint for local development
   */
  static async mockDownloadHandler(req: Request, res: Response) {
    const { key, filename } = req.query;
    const downloadName = (filename as string) || 'software-file.zip';

    // Send a sample binary ZIP response (or text payload for mock testing)
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    return res.status(200).send(Buffer.from(`MOCK REPAIR SOFTWARE PACKAGE FILE CONTENT FOR: ${downloadName} [Key: ${key}]`));
  }

  /**
   * Get current storage usage & limit status
   */
  static async getStorageStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await StorageService.getStorageStats();
      return sendSuccess(res, stats, 'Storage statistics retrieved');
    } catch (error) {
      return next(error);
    }
  }
}
