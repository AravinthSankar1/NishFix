import { Request, Response, NextFunction } from 'express';
import { SoftwareService } from '../services/softwareService.js';
import { StorageService } from '../services/storageService.js';
import {
  createSoftwareSchema,
  updateSoftwareSchema,
  querySoftwareSchema,
} from '../validation/softwareValidation.js';
import { sendSuccess } from '../utilities/response.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const getIdParam = (req: Request): string => {
  const id = req.params.id;
  if (Array.isArray(id)) return id[0];
  return id || '';
};

export class SoftwareController {
  // PUBLIC ENDPOINTS

  static async listPublicSoftware(req: Request, res: Response, next: NextFunction) {
    try {
      const query = querySoftwareSchema.parse(req.query);
      const result = await SoftwareService.listSoftware(query, true);
      return sendSuccess(res, result, 'Public software retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getPublicSoftwareById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getIdParam(req);
      const software = await SoftwareService.getSoftwareById(id, true);
      return sendSuccess(res, software, 'Software details retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getBrands(req: Request, res: Response, next: NextFunction) {
    try {
      const subCategory = typeof req.query.subCategory === 'string' ? req.query.subCategory : undefined;
      const brands = await SoftwareService.getBrands(subCategory);
      return sendSuccess(res, brands, 'Brands list retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getDataWorksStructure(req: Request, res: Response, next: NextFunction) {
    try {
      const structure = await SoftwareService.getDataWorksStructure();
      return sendSuccess(res, structure, 'Borneo DataWorks categories retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async downloadSoftware(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getIdParam(req);
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const downloadInfo = await StorageService.requestDownloadUrl(id, clientIp, userAgent);
      return sendSuccess(res, downloadInfo, 'Download URL generated successfully');
    } catch (error) {
      return next(error);
    }
  }

  // USER / ADMIN UPLOAD ENDPOINT
  static async userUploadSoftware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createSoftwareSchema.parse(req.body);
      const userId = req.user?.id;
      // If user uploaded, set uploaderName if not provided
      if (!input.uploaderName && req.user?.email) {
        input.uploaderName = req.user.email.split('@')[0];
      }
      const created = await SoftwareService.createSoftware(input, userId);
      return sendSuccess(res, created, 'Software uploaded and published successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  // ADMIN ENDPOINTS

  static async listAdminSoftware(req: Request, res: Response, next: NextFunction) {
    try {
      const query = querySoftwareSchema.parse(req.query);
      const result = await SoftwareService.listSoftware(query, false);
      return sendSuccess(res, result, 'Admin software list retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getAdminSoftwareById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getIdParam(req);
      const software = await SoftwareService.getSoftwareById(id, false);
      return sendSuccess(res, software, 'Admin software details retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async createSoftware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createSoftwareSchema.parse(req.body);
      const created = await SoftwareService.createSoftware(input, req.user?.id);
      return sendSuccess(res, created, 'Software entry created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async updateSoftware(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getIdParam(req);
      const input = updateSoftwareSchema.parse(req.body);
      const updated = await SoftwareService.updateSoftware(id, input);
      return sendSuccess(res, updated, 'Software entry updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async deleteSoftware(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getIdParam(req);
      const result = await SoftwareService.deleteSoftware(id);
      return sendSuccess(res, result, 'Software deleted successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async publishSoftware(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getIdParam(req);
      const updated = await SoftwareService.changeStatus(id, 'PUBLISHED');
      return sendSuccess(res, updated, 'Software published successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async unpublishSoftware(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getIdParam(req);
      const updated = await SoftwareService.changeStatus(id, 'DRAFT');
      return sendSuccess(res, updated, 'Software unpublished (moved to Draft)');
    } catch (error) {
      return next(error);
    }
  }

  static async archiveSoftware(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getIdParam(req);
      const updated = await SoftwareService.changeStatus(id, 'ARCHIVED');
      return sendSuccess(res, updated, 'Software archived successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await SoftwareService.getDashboardStats();
      return sendSuccess(res, stats, 'Dashboard statistics retrieved');
    } catch (error) {
      return next(error);
    }
  }
}
