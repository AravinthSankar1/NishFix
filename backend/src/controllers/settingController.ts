import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/db.js';
import { GoogleDriveService } from '../services/googleDriveService.js';
import { sendSuccess, sendError } from '../utilities/response.js';

export class SettingController {
  /**
   * Get public hero image URL
   */
  static async getHeroImage(req: Request, res: Response, next: NextFunction) {
    try {
      const setting = await prisma.siteSetting.findUnique({
        where: { key: 'hero_image' },
      });

      return sendSuccess(
        res,
        { imageUrl: setting ? setting.value : null },
        'Hero image setting retrieved'
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update hero photo - stores in dedicated Google Drive "Hero Photos" folder
   */
  static async updateHeroImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return sendError(res, 'No image file provided', 400, 'NO_IMAGE');
      }

      const file = req.file;

      // Upload to Google Drive dedicated "Hero Photos" folder
      const result = await GoogleDriveService.uploadHeroPhoto({
        filePath: file.path,
        originalName: file.originalname,
        mimeType: file.mimetype,
      });

      // Save URL to database
      await prisma.siteSetting.upsert({
        where: { key: 'hero_image' },
        update: { value: result.imageUrl },
        create: { key: 'hero_image', value: result.imageUrl },
      });

      return sendSuccess(
        res,
        {
          imageUrl: result.imageUrl,
          fileId: result.fileId,
          folderId: result.folderId,
        },
        'Hero photo updated successfully in Google Drive Hero Photos folder'
      );
    } catch (error) {
      return next(error);
    }
  }
}
