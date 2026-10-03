import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utilities/jwt.js';
import { sendError } from '../utilities/response.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Check Authorization Header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(
        res,
        'Authentication required. Please login as admin.',
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
      'Invalid or expired session. Please login again.',
      401,
      'INVALID_TOKEN'
    );
  }
};
