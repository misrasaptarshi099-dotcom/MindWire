import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = Router();

// Protect all user routes and restrict to admin
router.use(protect);
router.use(restrictTo('admin'));

// @route   GET /api/users
// @desc    Get all users
// @access  Admin
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404, 'NOT_FOUND'));
    }

    if (user.role === 'admin') {
      return next(new AppError('Cannot delete an admin user', 403, 'FORBIDDEN'));
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
