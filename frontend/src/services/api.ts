import axios from 'axios';
import type {
  ApiResponse,
  SoftwareListResponse,
  Software,
  BrandFilter,
  DashboardStats,
  PresignedUploadResponse,
  PresignedDownloadResponse,
  AdminUser,
  User,
  DataWorksStructure,
  FileUploadResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;
    const message = errorData?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ADMIN AUTH
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ token: string; user: AdminUser }>>('/auth/login', {
      email,
      password,
    });
    return res.data.data;
  },
  logout: async () => {
    const res = await api.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get<ApiResponse<AdminUser>>('/auth/me');
    return res.data.data;
  },
};

// USER AUTH (FORGOT PASSWORD / REGISTRATION / LOGIN / PROFILE)
export const userAuthApi = {
  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/users/register', data);
    return res.data.data;
  },
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/users/login', {
      email,
      password,
    });
    return res.data.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post<ApiResponse<{ message: string; resetToken?: string; expiresAt?: string }>>(
      '/users/forgot-password',
      { email }
    );
    return res.data;
  },
  resetPassword: async (token: string, newPassword: string) => {
    const res = await api.post<ApiResponse<{ message: string }>>('/users/reset-password', {
      token,
      newPassword,
    });
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get<ApiResponse<User>>('/users/me');
    return res.data.data;
  },
  updateProfile: async (data: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) => {
    const res = await api.put<ApiResponse<User>>('/users/me', data);
    return res.data.data;
  },
  logout: async () => {
    const res = await api.post<ApiResponse<null>>('/users/logout');
    return res.data;
  },
};

// PUBLIC SOFTWARE & BORNEO DATAWORKS
export const publicSoftwareApi = {
  listSoftware: async (params?: {
    search?: string;
    brand?: string;
    model?: string;
    category?: string;
    subCategory?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const res = await api.get<ApiResponse<SoftwareListResponse>>('/software', { params });
    return res.data.data;
  },
  getBrands: async (subCategory?: string) => {
    const res = await api.get<ApiResponse<BrandFilter[]>>('/software/brands', {
      params: subCategory ? { subCategory } : undefined,
    });
    return res.data.data;
  },
  getDataWorksStructure: async () => {
    const res = await api.get<ApiResponse<DataWorksStructure>>('/software/dataworks-structure');
    return res.data.data;
  },
  getSoftwareById: async (id: string) => {
    const res = await api.get<ApiResponse<Software>>(`/software/${id}`);
    return res.data.data;
  },
  requestDownloadUrl: async (id: string) => {
    const res = await api.post<ApiResponse<PresignedDownloadResponse>>(`/software/${id}/download`);
    return res.data.data;
  },
  userUploadSoftware: async (data: Partial<Software>) => {
    const res = await api.post<ApiResponse<Software>>('/software/user-upload', data);
    return res.data.data;
  },
};

// ADMIN SOFTWARE
export const adminSoftwareApi = {
  getDashboardStats: async () => {
    const res = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return res.data.data;
  },
  listSoftware: async (params?: {
    search?: string;
    brand?: string;
    category?: string;
    subCategory?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<ApiResponse<SoftwareListResponse>>('/admin/software', { params });
    return res.data.data;
  },
  getSoftwareById: async (id: string) => {
    const res = await api.get<ApiResponse<Software>>(`/admin/software/${id}`);
    return res.data.data;
  },
  createSoftware: async (data: Partial<Software>) => {
    const res = await api.post<ApiResponse<Software>>('/admin/software', data);
    return res.data.data;
  },
  updateSoftware: async (id: string, data: Partial<Software>) => {
    const res = await api.put<ApiResponse<Software>>(`/admin/software/${id}`, data);
    return res.data.data;
  },
  deleteSoftware: async (id: string) => {
    const res = await api.delete<ApiResponse<{ id: string; message: string }>>(`/admin/software/${id}`);
    return res.data.data;
  },
  publishSoftware: async (id: string) => {
    const res = await api.post<ApiResponse<Software>>(`/admin/software/${id}/publish`);
    return res.data.data;
  },
  unpublishSoftware: async (id: string) => {
    const res = await api.post<ApiResponse<Software>>(`/admin/software/${id}/unpublish`);
    return res.data.data;
  },
  archiveSoftware: async (id: string) => {
    const res = await api.post<ApiResponse<Software>>(`/admin/software/${id}/archive`);
    return res.data.data;
  },
};

// REAL MULTIPART STORAGE & R2
export const storageApi = {
  /**
   * Upload real file directly to the backend storage
   */
  uploadRealFile: async (file: File, onProgress?: (percent: number) => void): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<ApiResponse<FileUploadResponse>>('/uploads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return res.data.data;
  },

  requestUploadUrl: async (payload: {
    fileType: 'image' | 'zip';
    fileName: string;
    mimeType: string;
    fileSize: number;
    softwareId?: string;
  }) => {
    const res = await api.post<ApiResponse<PresignedUploadResponse>>('/uploads/presigned-url', payload);
    return res.data.data;
  },

  uploadFileToR2: async (uploadUrl: string, file: File, onProgress?: (percent: number) => void) => {
    if (uploadUrl.includes('/api/uploads/mock-upload')) {
      await api.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });
      return;
    }

    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },
};
