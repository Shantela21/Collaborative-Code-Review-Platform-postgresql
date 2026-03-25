import { Router } from 'express';
import { auth } from '../middleware/auth';
import { getProjectStats, getUserStats } from '../controllers/statsController';

const router = Router();

// Apply auth middleware to all stats routes
router.use(auth);

// Project statistics
router.get('/projects/:id/stats', getProjectStats);

// User statistics  
router.get('/users/stats', getUserStats);

export default router;
