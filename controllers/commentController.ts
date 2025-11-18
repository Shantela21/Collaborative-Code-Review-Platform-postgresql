import { Request, Response } from 'express';
import { Comment, CommentModel } from '../models/commentsModel';
import { SubmissionModel } from '../models/submissionModel';
import { ProjectModel } from '../models/projectModel';

export const createComment = async (req: Request, res: Response) => {
  try {
    const { content, submission_id, parent_id } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    if (!content || !submission_id) {
      return res.status(400).json({ 
        message: 'Content and submission_id are required' 
      });
    }

    // Check if submission exists
    const submission = await SubmissionModel.findById(submission_id);
    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    // Check if user is a member of the project
    const isMember = await ProjectModel.isMember(submission.project_id, userId);
    if (!isMember) {
      return res.status(403).json({ 
        message: 'Not a member of this project' 
      });
    }

    // If parent_id is provided, check if parent comment exists
    if (parent_id) {
      const parentComment = await CommentModel.findById(parent_id);
      if (!parentComment) {
        return res.status(404).json({ 
          message: 'Parent comment not found' 
        });
      }
    }

    const comment = await CommentModel.create({
      content,
      submission_id,
      user_id: userId,
      parent_id
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to create comment' 
    });
  }
};

export const getCommentsBySubmission = async (req: Request, res: Response) => {
  try {
    const { submission_id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const submissionId = parseInt(submission_id);
    if (isNaN(submissionId)) {
      return res.status(400).json({ 
        message: 'Invalid submission ID' 
      });
    }

    // Check if submission exists
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
        message: 'Not a member of this project' 
      });
    }

    const comments = await CommentModel.findBySubmissionId(submissionId);
    
    res.status(200).json(comments);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch comments' 
    });
  }
};

export const getCommentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const commentId = parseInt(id);
    if (isNaN(commentId)) {
      return res.status(400).json({ 
        message: 'Invalid comment ID' 
      });
    }

    const comment = await CommentModel.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ 
        message: 'Comment not found' 
      });
    }

    // Check if user is a member of the project
    const submission = await SubmissionModel.findById(comment.submission_id);
    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    const isMember = await ProjectModel.isMember(submission.project_id, userId);
    if (!isMember) {
      return res.status(403).json({ 
        message: 'Not authorized to view this comment' 
      });
    }

    res.status(200).json(comment);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch comment' 
    });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const commentId = parseInt(id);
    if (isNaN(commentId)) {
      return res.status(400).json({ 
        message: 'Invalid comment ID' 
      });
    }

    if (!content) {
      return res.status(400).json({ 
        message: 'Content is required' 
      });
    }

    const comment = await CommentModel.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ 
        message: 'Comment not found' 
      });
    }

    // Only the comment author can update the comment
    if (comment.user_id !== userId) {
      return res.status(403).json({ 
        message: 'Not authorized to update this comment' 
      });
    }

    const updatedComment = await CommentModel.update(commentId, content);
    
    res.status(200).json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to update comment' 
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const commentId = parseInt(id);
    if (isNaN(commentId)) {
      return res.status(400).json({ 
        message: 'Invalid comment ID' 
      });
    }

    const comment = await CommentModel.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ 
        message: 'Comment not found' 
      });
    }

    // Only the comment author can delete the comment
    if (comment.user_id !== userId) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this comment' 
      });
    }

    const deleted = await CommentModel.delete(commentId);
    
    if (!deleted) {
      return res.status(404).json({ 
        message: 'Comment not found' 
      });
    }

    res.status(200).json({ 
      message: 'Comment deleted successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to delete comment' 
    });
  }
};

export const getReplies = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const commentId = parseInt(id);
    if (isNaN(commentId)) {
      return res.status(400).json({ 
        message: 'Invalid comment ID' 
      });
    }

    const parentComment = await CommentModel.findById(commentId);
    
    if (!parentComment) {
      return res.status(404).json({ 
        message: 'Comment not found' 
      });
    }

    // Check if user is a member of the project
    const submission = await SubmissionModel.findById(parentComment.submission_id);
    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    const isMember = await ProjectModel.isMember(submission.project_id, userId);
    if (!isMember) {
      return res.status(403).json({ 
        message: 'Not authorized to view replies' 
      });
    }

    const replies = await CommentModel.getReplies(commentId);
    
    res.status(200).json(replies);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch replies' 
    });
  }
};
