import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';
import { validateBody } from '../middlewares/validation.js';
import { rateLimiter } from '../middlewares/rateLimit.js';
import { protect } from '../middlewares/auth.js';
import { registerSchema, loginSchema } from '@mindwire/shared';
import { sendAccountCreatedEmail } from '../utils/email.js';

const router = Router();
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is missing.');
}

const signToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, jwtSecret, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists.', 409, 'ALREADY_REGISTERED'));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user', // Default role
    });

    sendAccountCreatedEmail(user.email, user.name).catch(err => console.error(err));

    const token = signToken(user._id.toString(), user.role);

    res.cookie('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.cookie('user_logged_in', 'true', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', rateLimiter(5, 60), validateBody(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS'));
    }

    const token = signToken(user._id.toString(), user.role);

    res.cookie('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.cookie('user_logged_in', 'true', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user profile
// @access  Private
router.get('/me', protect, async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

// @route   POST /api/auth/logout
// @desc    Logout user & clear cookies
// @access  Public
router.post('/logout', (_req: Request, res: Response) => {
  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  };
  res.clearCookie('user_token', { ...cookieOptions, httpOnly: true });
  res.clearCookie('user_logged_in', cookieOptions);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;
