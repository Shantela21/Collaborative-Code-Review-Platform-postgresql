require('dotenv').config();
import { Router } from 'express';
import { auth } from '../middleware/auth';
import { 
  createProject, 
  getAllProjects, 
  getProjectById, 
  updateProject, 
  deleteProject,
  addProjectMember,
  removeProjectMember
} from '../controllers/projectController';
import { getSubmissionsByProject } from '../controllers/projectSubmissionsController';

const router = Router();

// Apply auth middleware to all project routes
router.use(auth);

// Project CRUD routes
router.post('/', createProject);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Project member management routes
router.post('/:id/members', addProjectMember);
router.delete('/:id/members/:userId', removeProjectMember);

// Project submissions route
router.get('/:id/submissions', getSubmissionsByProject);

export default router;