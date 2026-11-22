import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { env } from '../config/env.js';
import { StorageService } from '../services/storageService.js';
import { GoogleDriveService } from '../services/googleDriveService.js';
import { uploadUrlSchema } from '../validation/softwareValidation.js';
import { sendSuccess, sendError } from '../utilities/response.js';

export class StorageController {
  /**
   * Start 1-Click Google OAuth flow to link personal Google Drive
   */
  static async getGoogleAuthUrl(req: Request, res: Response) {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      return res.status(400).send(`
        <html>
          <body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center;">
            <h2>Google OAuth Client ID & Secret Required</h2>
            <p>Please add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> to your <code>backend/.env</code> file first.</p>
            <p><a href="/admin" style="color: #38bdf8;">Return to Admin Dashboard</a></p>
          </body>
        </html>
      `);
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/uploads/gdrive-callback`;
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/drive'],
    });

    return res.redirect(authUrl);
  }

  /**
   * Handle OAuth Callback from Google and store refresh_token
   */
  static async handleGoogleAuthCallback(req: Request, res: Response) {
    try {
      const code = req.query.code as string;
      if (!code) {
        return res.redirect(`${env.CLIENT_URL}/admin?error=no_code_provided`);
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/uploads/gdrive-callback`;
      const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );

      const { tokens } = await oauth2Client.getToken(code);
      if (tokens.refresh_token) {
        const envPath = path.resolve(process.cwd(), '.env');
        let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
        if (content.includes('GOOGLE_REFRESH_TOKEN=')) {
          content = content.replace(/GOOGLE_REFRESH_TOKEN=.*/, `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        } else {
          content += `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`;
        }
        fs.writeFileSync(envPath, content);
        env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
      }

      return res.redirect(`${env.CLIENT_URL}/admin?gdrive_connected=true`);
    } catch (err: any) {
      console.error('OAuth Callback Error:', err);
      return res.redirect(`${env.CLIENT_URL}/admin?error=${encodeURIComponent(err?.message || 'auth_failed')}`);
    }
  }

  /**
   * Real multipart file upload endpoint (Multer handler - Local Storage)
   */
  static async uploadFileHandler(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return sendError(res, 'No file was provided in the upload request', 400, 'NO_FILE');
      }

      const file = req.file;
      const fileUrl = `/uploads/${file.filename}`;

      return sendSuccess(
        res,
        {
          fileUrl,
          fileName: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          isGoogleDrive: false,
        },
        'File uploaded successfully to server storage'
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Direct Upload to Google Drive
   * Streams the file directly into Google Drive, makes it public, and returns the Drive links
   */
  static async uploadToGoogleDriveHandler(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return sendError(res, 'No file was provided in the upload request', 400, 'NO_FILE');
      }

      const file = req.file;
      const folderId = req.body.folderId as string | undefined;

      const driveResult = await GoogleDriveService.uploadFile({
        filePath: file.path,
        originalName: file.originalname,
        mimeType: file.mimetype,
        folderId,
      });

      return sendSuccess(
        res,
        driveResult,
        driveResult.isGoogleDrive
          ? 'File successfully uploaded directly to Google Drive'
          : 'File uploaded locally (Google Drive credentials can be configured in backend/.env)'
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Check Google Drive configuration status
   */
  static async getGoogleDriveStatus(req: Request, res: Response) {
    const status = GoogleDriveService.getStatus();
    return sendSuccess(res, status, 'Google Drive integration status retrieved');
  }

  /**
   * Request a presigned upload URL for direct browser-to-R2 upload (fallback)
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
    console.log(`[Storage]: Received upload for object key: ${key}`);
    return res.status(200).json({
      success: true,
      message: 'File upload processed successfully',
      key,
    });
  }

  /**
   * Mock download endpoint for local development
   */
  static async mockDownloadHandler(req: Request, res: Response) {
    const { key, filename } = req.query;
    const downloadName = (filename as string) || 'software-file.zip';

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    return res.status(200).send(Buffer.from(`REPAIR SOFTWARE PACKAGE FILE CONTENT FOR: ${downloadName} [Key: ${key}]`));
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
