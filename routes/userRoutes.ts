import { Router } from 'express';
import { userController } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', userController.getUserById);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', userController.updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private
router.delete('/:id', userController.deleteUser);

export default router;