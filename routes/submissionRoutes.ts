import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createSubmission,
  getAllSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  updateSubmissionStatus
} from '../controllers/submissionController';

const router = Router();

// Apply auth middleware to all submission routes
router.use(auth);

// Submission CRUD routes
router.post('/', createSubmission);
router.get('/', getAllSubmissions);
router.get('/:id', getSubmissionById);
router.put('/:id', updateSubmission);
router.delete('/:id', deleteSubmission);

// Submission status update
router.patch('/:id/status', updateSubmissionStatus);

export default router;
