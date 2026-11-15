import { Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utilities/jwt.js';
import { sendError } from '../utilities/response.js';
import { AuthenticatedRequest } from './authMiddleware.js';

export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(
        res,
        'Authentication required. Please log in or register.',
        401,
        'UNAUTHORIZED'
      );
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return sendError(
      res,
      'Invalid or expired session. Please log in again.',
      401,
      'INVALID_TOKEN'
    );
  }
};
