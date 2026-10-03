import { env } from '../config/env.js';

export const getStorageConfigStatus = () => {
  return {
    isConfigured: false,
    bucketName: 'URL Mirror Library',
    freeTierLimitBytes: 0,
    publicBaseUrl: '',
  };
};

export const generatePresignedUploadUrl = async (
  objectKey: string,
  contentType: string
) => {
  return { uploadUrl: '', objectKey, isMock: true };
};

export const generatePresignedDownloadUrl = async (
  objectKey: string,
  originalFileName: string
) => {
  return { downloadUrl: '#', isMock: true };
};

export const deleteStorageObject = async (objectKey: string): Promise<boolean> => {
  return true;
};

export const checkObjectExists = async (objectKey: string) => {
  return { exists: true };
};
