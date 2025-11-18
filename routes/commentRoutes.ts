import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createComment,
  getCommentsBySubmission,
  getCommentById,
  updateComment,
  deleteComment,
  getReplies
} from '../controllers/commentController';

const router = Router();

// Apply auth middleware to all comment routes
router.use(auth);

// Comment CRUD routes
router.post('/', createComment);
router.get('/submission/:submission_id', getCommentsBySubmission);
router.get('/:id', getCommentById);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

// Get replies to a comment
router.get('/:id/replies', getReplies);

export default router;
