import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createReview,
  getReviewsBySubmission,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByUser,
  getPendingReviews,
  approveSubmission,
  rejectSubmission
} from '../controllers/reviewController';

const router = Router();

// Apply auth middleware to all review routes
router.use(auth);

// Review CRUD routes
router.post('/', createReview);
router.get('/submission/:submission_id', getReviewsBySubmission);
router.get('/user/:user_id', getReviewsByUser);
router.get('/pending', getPendingReviews);
router.get('/:id', getReviewById);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

// Review workflow endpoints
router.post('/approve', approveSubmission);
router.post('/reject', rejectSubmission);

export default router;
