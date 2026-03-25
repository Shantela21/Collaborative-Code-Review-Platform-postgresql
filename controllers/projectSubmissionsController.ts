import { Request, Response } from 'express';
import { SubmissionModel } from '../models/submissionModel';
import { ProjectModel } from '../models/projectModel';

export const getSubmissionsByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    if (!projectId) {
      return res.status(400).json({ 
        message: 'Project ID is required' 
      });
    }

    // Check if user is a member of the project
    const isMember = await ProjectModel.isMember(parseInt(projectId), userId);
    if (!isMember) {
      return res.status(403).json({ 
        message: 'Not a member of this project' 
      });
    }

    const submissions = await SubmissionModel.findByProjectId(
      parseInt(projectId), 
      limit, 
      offset
    );

    res.json({
      submissions,
      pagination: {
        limit,
        offset,
        hasMore: submissions.length === limit
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch project submissions' 
    });
  }
};
