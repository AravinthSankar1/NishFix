import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  error?: any;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  code: string = 'INTERNAL_ERROR',
  errorDetails: any = null
) => {
  const response: ApiResponse = {
    success: false,
    message,
    code,
  };

  if (process.env.NODE_ENV !== 'production' && errorDetails) {
    response.error = errorDetails;
  }

  return res.status(statusCode).json(response);
};
