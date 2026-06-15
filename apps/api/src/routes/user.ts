import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Enquiry } from '../models/Enquiry.js';
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
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      role: { $ne: 'admin' },
    });

    if (!user) {
      // Either user doesn't exist or is an admin
      const exists = await User.exists({ _id: req.params.id });
      if (exists) {
        return next(new AppError('Cannot delete an admin user', 403, 'FORBIDDEN'));
      }
      return next(new AppError('User not found', 404, 'NOT_FOUND'));
    }

    // Cascade delete associated enquiries
    await Enquiry.deleteMany({ email: user.email });

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
