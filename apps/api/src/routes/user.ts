import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Enquiry } from '../models/Enquiry.js';
import { Workshop } from '../models/Workshop.js';
import { getRedisClient } from '../config/redis.js';
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
    const user = await User.findOne({
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

    // Find enrolled enquiries to restore seats
    const enrolledEnquiries = await Enquiry.find({ email: user.email, status: 'enrolled' });
    for (const enq of enrolledEnquiries) {
      const workshop = await Workshop.findOneAndUpdate(
        { workshopId: enq.workshopId },
        { 
          $inc: { 
            seatsAvailable: 1, 
            'batches.$[b].enrolled': -1 
          } 
        },
        {
          arrayFilters: [{ 'b.batchId': enq.batchId }],
          new: true
        }
      );
      if (workshop) {
        const redis = getRedisClient();
        await redis.set('workshop:seats', String(workshop.seatsAvailable), 'EX', 60);
        await redis.del('workshop:info');
      }
    }

    // Delete the user and cascade delete associated enquiries
    await User.findByIdAndDelete(user._id);
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
