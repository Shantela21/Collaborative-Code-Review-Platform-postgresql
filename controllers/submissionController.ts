import { Request, Response } from 'express';
import { Submission, SubmissionModel } from '../models/submissionModel';
import { ProjectModel } from '../models/projectModel';

export const createSubmission = async (req: Request, res: Response) => {
  try {
    const { title, description, code_content, project_id } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    if (!title || !code_content || !project_id) {
      return res.status(400).json({ 
        message: 'Title, code_content, and project_id are required' 
      });
    }

    // Check if user is a member of the project
    const isMember = await ProjectModel.isMember(project_id, userId);
    if (!isMember) {
      return res.status(403).json({ 
        message: 'Not a member of this project' 
      });
    }

    const submission = await SubmissionModel.create({
      title,
      description,
      code_content,
      project_id,
      submitted_by: userId
    });

    res.status(201).json({
      message: 'Submission created successfully',
      submission
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to create submission' 
    });
  }
};

export const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const projectId = req.query.project_id as string;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    let submissions: Submission[];
    
    if (projectId) {
      // Check if user is a member of the project
      const isMember = await ProjectModel.isMember(parseInt(projectId), userId);
      if (!isMember) {
        return res.status(403).json({ 
          message: 'Not a member of this project' 
        });
      }
      submissions = await SubmissionModel.findByProjectId(parseInt(projectId));
    } else {
      submissions = await SubmissionModel.findByUserId(userId);
    }

    res.status(200).json(submissions);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch submissions' 
    });
  }
};

export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const submissionId = parseInt(id);
    if (isNaN(submissionId)) {
      return res.status(400).json({ 
        message: 'Invalid submission ID' 
      });
    }

    const submission = await SubmissionModel.findById(submissionId);
    
    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    // Check if user is a member of the project
    const isMember = await ProjectModel.isMember(submission.project_id, userId);
    if (!isMember) {
      return res.status(403).json({ 
        message: 'Not authorized to view this submission' 
      });
    }

    res.status(200).json(submission);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch submission' 
    });
  }
};

export const updateSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, code_content } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const submissionId = parseInt(id);
    if (isNaN(submissionId)) {
      return res.status(400).json({ 
        message: 'Invalid submission ID' 
      });
    }

    const submission = await SubmissionModel.findById(submissionId);
    
    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    // Only the submitter can update the submission
    if (submission.submitted_by !== userId) {
      return res.status(403).json({ 
        message: 'Not authorized to update this submission' 
      });
    }

    const updates: any = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (code_content) updates.code_content = code_content;

    const updatedSubmission = await SubmissionModel.update(submissionId, updates);
    
    res.status(200).json({
      message: 'Submission updated successfully',
      submission: updatedSubmission
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to update submission' 
    });
  }
};

export const deleteSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const submissionId = parseInt(id);
    if (isNaN(submissionId)) {
      return res.status(400).json({ 
        message: 'Invalid submission ID' 
      });
    }

    const submission = await SubmissionModel.findById(submissionId);
    
    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    // Only the submitter can delete the submission
    if (submission.submitted_by !== userId) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this submission' 
      });
    }

    const deleted = await SubmissionModel.delete(submissionId);
    
    if (!deleted) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    res.status(200).json({ 
      message: 'Submission deleted successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to delete submission' 
    });
  }
};

export const updateSubmissionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const submissionId = parseInt(id);
    if (isNaN(submissionId)) {
      return res.status(400).json({ 
        message: 'Invalid submission ID' 
      });
    }

    if (!['pending', 'approved', 'rejected', 'needs_changes'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status' 
      });
    }

    const submission = await SubmissionModel.findById(submissionId);
    
    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    // Check if user is a member of the project
    const isMember = await ProjectModel.isMember(submission.project_id, userId);
    if (!isMember) {
      return res.status(403).json({ 
        message: 'Not authorized to update this submission' 
      });
    }

    const updatedSubmission = await SubmissionModel.updateStatus(submissionId, status);
    
    res.status(200).json({
      message: 'Submission status updated successfully',
      submission: updatedSubmission
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to update submission status' 
    });
  }
};