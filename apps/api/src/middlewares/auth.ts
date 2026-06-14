import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';
import { User } from '../models/User.js';

export interface TokenPayload {
  userId: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'user' | 'admin';
        name: string;
        email: string;
      };
      token?: string;
    }
  }
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is missing.');
}

export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
      const parts = c.split('=');
      const key = parts[0]?.trim();
      const val = parts.slice(1).join('=')?.trim();
      if (key) acc[key] = val;
      return acc;
    }, {} as Record<string, string>);
    if (cookies.user_token) {
      token = cookies.user_token;
    }
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route.', 401, 'NOT_AUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401, 'USER_NOT_FOUND'));
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    };
    req.token = token;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401, 'EXPIRED_TOKEN'));
    }
    return next(new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN'));
  }
};

export const restrictTo = (...roles: Array<'user' | 'admin'>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403, 'FORBIDDEN'));
    }
    next();
  };
};
