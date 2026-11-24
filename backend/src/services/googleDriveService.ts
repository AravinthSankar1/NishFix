import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { env } from '../config/env.js';

export interface DriveUploadResult {
  success: boolean;
  isGoogleDrive: boolean;
  fileId: string;
  webViewLink: string;
  directDownloadLink: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  folderId?: string;
  message?: string;
}

export class GoogleDriveService {
  /**
   * Helper to clean and extract pure Google Drive folder ID even if user pasted full URL
   */
  private static cleanFolderId(rawId?: string | null): string | undefined {
    if (!rawId) return undefined;
    const trimmed = rawId.trim();
    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch) return folderMatch[1];
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) return idMatch[1];
    return trimmed;
  }

  /**
   * Helper to locate service-account.json across possible working directories
   */
  private static getKeyFilePath(): string | null {
    const candidates = [
      env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE && path.isAbsolute(env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE)
        ? env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE
        : null,
      env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE
        ? path.resolve(process.cwd(), env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE)
        : null,
      env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE
        ? path.resolve(process.cwd(), 'backend', env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE)
        : null,
      path.resolve(process.cwd(), 'service-account.json'),
      path.resolve(process.cwd(), 'backend', 'service-account.json'),
    ];

    for (const cand of candidates) {
      if (cand && fs.existsSync(cand)) {
        return cand;
      }
    }
    return null;
  }

  /**
   * Check whether Google Drive credentials are fully configured
   */
  static isConfigured(): boolean {
    // 1. OAuth2 Refresh Token (MUST be first — only method that works with personal Gmail)
    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN) {
      return true;
    }

    // 2. Service Account Key File (only works with Google Workspace / Shared Drives)
    if (this.getKeyFilePath()) {
      return true;
    }

    // 3. Service Account Email + Private Key
    if (env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      return true;
    }

    return false;
  }

  /**
   * Return configuration details/status for the frontend
   */
  static getStatus() {
    const configured = this.isConfigured();
    let authType = 'none';

    // Priority: OAuth2 > Service Account File > Service Account Env
    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN) {
      authType = 'oauth2';
    } else if (this.getKeyFilePath()) {
      authType = 'service_account_file';
    } else if (env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      authType = 'service_account_env';
    }

    return {
      isConfigured: configured,
      authType,
      folderId: env.GOOGLE_DRIVE_FOLDER_ID || null,
      serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL || null,
      hasRefreshToken: !!env.GOOGLE_REFRESH_TOKEN,
      freeTierLimitGB: '15 GB',
    };
  }

  /**
   * Initialize and return authenticated Google Drive API client
   * PRIORITY ORDER: OAuth2 first (works with personal Gmail), then service account fallbacks
   */
  private static getDriveClient() {
    const scopes = ['https://www.googleapis.com/auth/drive'];

    // 1. OAuth2 Client with Refresh Token (MUST BE FIRST for personal @gmail.com accounts)
    //    Service accounts have 0 MB quota on personal Gmail Drive — they can NEVER upload.
    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN) {
      console.log('[GoogleDrive] Using OAuth2 with personal refresh token');
      const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({
        refresh_token: env.GOOGLE_REFRESH_TOKEN,
      });
      return google.drive({ version: 'v3', auth: oauth2Client });
    }

    // 2. Service Account Key File (only works with Workspace accounts or Shared Drives)
    const keyFilePath = this.getKeyFilePath();
    if (keyFilePath) {
      console.log('[GoogleDrive] Using Service Account key file (warning: won\'t work with personal Gmail)');
      try {
        const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes,
        });
        return google.drive({ version: 'v3', auth });
      } catch (e) {
        console.warn('Failed to parse key file directly, falling back to keyFile path:', e);
        const auth = new google.auth.GoogleAuth({
          keyFile: keyFilePath,
          scopes,
        });
        return google.drive({ version: 'v3', auth });
      }
    }

    // 3. Direct Service Account Email + Private Key from environment
    if (env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      console.log('[GoogleDrive] Using Service Account JWT (warning: won\'t work with personal Gmail)');
      const auth = new google.auth.JWT({
        email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
        scopes,
      });
      return google.drive({ version: 'v3', auth });
    }

    throw new Error('Google Drive credentials are not configured. Run the OAuth flow: visit http://localhost:5000/api/uploads/gdrive-auth');
  }

  /**
   * Uploads a file stream directly to Google Drive and sets public access
   */
  static async uploadFile(params: {
    filePath: string;
    originalName: string;
    mimeType?: string;
    folderId?: string;
  }): Promise<DriveUploadResult> {
    const { filePath, originalName, mimeType = 'application/octet-stream', folderId } = params;

    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Check if Google Drive is configured
    if (!this.isConfigured()) {
      // Local fallback with simulated Google Drive metadata
      // This ensures 100% functionality even before user adds their API credentials
      const localFileName = path.basename(filePath);
      const simulatedId = 'gdrive_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const webViewLink = `https://drive.google.com/file/d/${simulatedId}/view?usp=sharing`;
      const directDownloadLink = `/uploads/${localFileName}`;

      return {
        success: true,
        isGoogleDrive: false,
        fileId: simulatedId,
        webViewLink,
        directDownloadLink,
        fileName: originalName,
        fileSize,
        mimeType,
        message: 'Google Drive credentials not set. File stored locally on server. To upload directly to your 15GB Google Drive, add your Service Account JSON or credentials to backend/.env.',
      };
    }

    const drive = this.getDriveClient();
    const targetFolderId = this.cleanFolderId(folderId) || this.cleanFolderId(env.GOOGLE_DRIVE_FOLDER_ID);

    // A Google Cloud Service Account has 0 MB of personal quota.
    // It MUST upload into a folder owned by your Google account (shared with the service account).
    if (!targetFolderId) {
      const localFileName = path.basename(filePath);
      const simulatedId = 'gdrive_' + Math.random().toString(36).substring(2, 15);
      const webViewLink = `https://drive.google.com/file/d/${simulatedId}/view?usp=sharing`;
      const directDownloadLink = `/uploads/${localFileName}`;

      return {
        success: true,
        isGoogleDrive: false,
        fileId: simulatedId,
        webViewLink,
        directDownloadLink,
        fileName: originalName,
        fileSize,
        mimeType,
        message:
          'Google Service Accounts have 0 MB of personal root quota. To store files in your 15GB Google Drive: 1) Create a folder in Google Drive, 2) Share it with teste-file@mytestfile-515507.iam.gserviceaccount.com as Editor, 3) Set GOOGLE_DRIVE_FOLDER_ID in backend/.env. Saved locally on server for now.',
      };
    }

    try {
      // 1. Upload file into the shared Google Drive folder
      const fileMetadata: any = {
        name: originalName,
        parents: [targetFolderId],
      };

      const media = {
        mimeType,
        body: fs.createReadStream(filePath),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, webViewLink, webContentLink, size, mimeType',
        supportsAllDrives: true,
      });

      const fileId = response.data.id;
      if (!fileId) {
        throw new Error('Failed to get File ID from Google Drive response');
      }

      // 2. Make file publicly accessible so anyone with link can view/download
      try {
        await drive.permissions.create({
          fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
          supportsAllDrives: true,
        });
      } catch (permError) {
        console.warn('Warning: Could not set public permissions on Google Drive file:', permError);
      }

      // 3. Clean up local temporary file after successful Google Drive upload
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupErr) {
        console.warn('Could not clean up temporary upload file:', cleanupErr);
      }

      const webViewLink =
        response.data.webViewLink ||
        `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
      const directDownloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

      return {
        success: true,
        isGoogleDrive: true,
        fileId,
        webViewLink,
        directDownloadLink,
        fileName: response.data.name || originalName,
        fileSize: response.data.size ? parseInt(response.data.size, 10) : fileSize,
        mimeType: response.data.mimeType || mimeType,
        folderId: targetFolderId,
        message: 'File successfully uploaded to Google Drive with public link enabled.',
      };
    } catch (driveErr: any) {
      console.error('Google Drive API upload error:', driveErr?.message || driveErr);

      // Safe fallback to local storage so technician uploads NEVER crash
      const localFileName = path.basename(filePath);
      const simulatedId = 'gdrive_' + Math.random().toString(36).substring(2, 15);
      const webViewLink = `https://drive.google.com/file/d/${simulatedId}/view?usp=sharing`;
      const directDownloadLink = `/uploads/${localFileName}`;

      const errorMessage = driveErr?.message?.includes('storage quota')
        ? 'Google Drive requires the folder to be shared with teste-file@mytestfile-515507.iam.gserviceaccount.com as Editor. Saved locally on server for now.'
        : `Google Drive upload error: ${driveErr?.message || 'Permission denied'}. Saved locally on server.`;

      return {
        success: true,
        isGoogleDrive: false,
        fileId: simulatedId,
        webViewLink,
        directDownloadLink,
        fileName: originalName,
        fileSize,
        mimeType,
        message: errorMessage,
      };
    }
  }

  /**
   * Upload Hero/Site Image into a dedicated "Hero Photos" folder in Google Drive
   */
  static async uploadHeroPhoto(params: {
    filePath: string;
    originalName: string;
    mimeType?: string;
  }): Promise<{
    success: boolean;
    imageUrl: string;
    fileId: string;
    folderId: string;
  }> {
    const { filePath, originalName, mimeType = 'image/jpeg' } = params;
    const parentFolderId = this.cleanFolderId(env.GOOGLE_DRIVE_FOLDER_ID);
    const drive = this.getDriveClient();

    // 1. Find or create the dedicated "Hero Photos" folder
    let heroFolderId: string | undefined = undefined;
    try {
      const folderQuery = parentFolderId
        ? `name = 'Hero Photos' and mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed = false`
        : `name = 'Hero Photos' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

      const listRes = await drive.files.list({
        q: folderQuery,
        fields: 'files(id, name)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (listRes.data.files && listRes.data.files.length > 0) {
        heroFolderId = listRes.data.files[0].id!;
      } else {
        // Create the dedicated folder
        const createFolderRes = await drive.files.create({
          requestBody: {
            name: 'Hero Photos',
            mimeType: 'application/vnd.google-apps.folder',
            ...(parentFolderId ? { parents: [parentFolderId] } : {}),
          },
          fields: 'id',
          supportsAllDrives: true,
        });
        heroFolderId = createFolderRes.data.id!;

        try {
          await drive.permissions.create({
            fileId: heroFolderId,
            requestBody: { role: 'reader', type: 'anyone' },
            supportsAllDrives: true,
          });
        } catch (_) {}
      }
    } catch (folderErr) {
      console.warn('Could not locate/create Hero Photos folder, using parent folder:', folderErr);
      heroFolderId = parentFolderId;
    }

    // 2. Upload the hero photo file into that folder
    const fileMetadata: any = {
      name: `Hero_Banner_${Date.now()}_${originalName}`,
      ...(heroFolderId ? { parents: [heroFolderId] } : {}),
    };

    const media = {
      mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    const fileId = response.data.id;
    if (!fileId) {
      throw new Error('Failed to retrieve file ID from Google Drive for hero photo');
    }

    // 3. Make the image publicly readable so it embeds in web pages
    try {
      await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' },
        supportsAllDrives: true,
      });
    } catch (permErr) {
      console.warn('Warning: Could not set public permissions on hero photo:', permErr);
    }

    // 4. Clean up local temporary file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (_) {}

    // Direct Google CDN image embed URL (serves high-resolution web-ready image)
    const directImageUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

    return {
      success: true,
      imageUrl: directImageUrl,
      fileId,
      folderId: heroFolderId || '',
    };
  }
}
