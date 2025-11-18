import { Request, Response } from 'express';
import { Review, ReviewModel } from '../models/reviewModel';
import { SubmissionModel } from '../models/submissionModel';
import { ProjectModel } from '../models/projectModel';

export const createReview = async (req: Request, res: Response) => {
  try {
    const { submission_id, status, feedback } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    if (!submission_id || !status) {
      return res.status(400).json({ 
        message: 'Submission ID and status are required' 
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

    // Check if user has already reviewed this submission
    const hasReviewed = await ReviewModel.hasReviewed(submission_id, userId);
    if (hasReviewed) {
      return res.status(400).json({ 
        message: 'You have already reviewed this submission' 
      });
    }

    const review = await ReviewModel.create({
      submission_id,
      reviewer_id: userId,
      status,
      feedback
    });

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to create review' 
    });
  }
};

export const getReviewsBySubmission = async (req: Request, res: Response) => {
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

    const reviews = await ReviewModel.findBySubmissionId(submissionId);
    
    res.status(200).json(reviews);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch reviews' 
    });
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const reviewId = parseInt(id);
    if (isNaN(reviewId)) {
      return res.status(400).json({ 
        message: 'Invalid review ID' 
      });
    }

    const review = await ReviewModel.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }

    // Check if user is a member of the project
    const submission = await SubmissionModel.findById(review.submission_id);
    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    const isMember = await ProjectModel.isMember(submission.project_id, userId);
    if (!isMember) {
      return res.status(403).json({ 
        message: 'Not authorized to view this review' 
      });
    }

    res.status(200).json(review);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch review' 
    });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const reviewId = parseInt(id);
    if (isNaN(reviewId)) {
      return res.status(400).json({ 
        message: 'Invalid review ID' 
      });
    }

    if (!status) {
      return res.status(400).json({ 
        message: 'Status is required' 
      });
    }

    const review = await ReviewModel.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }

    // Only the reviewer can update the review
    if (review.reviewer_id !== userId) {
      return res.status(403).json({ 
        message: 'Not authorized to update this review' 
      });
    }

    const updates: any = { status };
    if (feedback !== undefined) updates.feedback = feedback;

    const updatedReview = await ReviewModel.update(reviewId, updates);
    
    res.status(200).json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to update review' 
    });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const reviewId = parseInt(id);
    if (isNaN(reviewId)) {
      return res.status(400).json({ 
        message: 'Invalid review ID' 
      });
    }

    const review = await ReviewModel.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }

    // Only the reviewer can delete the review
    if (review.reviewer_id !== userId) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this review' 
      });
    }

    const deleted = await ReviewModel.delete(reviewId);
    
    if (!deleted) {
      return res.status(404).json({ 
        message: 'Review not found' 
      });
    }

    res.status(200).json({ 
      message: 'Review deleted successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to delete review' 
    });
  }
};

export const getReviewsByUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const currentUserId = req.user?.id;
    
    if (!currentUserId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const targetUserId = parseInt(user_id);
    if (isNaN(targetUserId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID' 
      });
    }

    // Users can only view their own reviews
    if (targetUserId !== currentUserId) {
      return res.status(403).json({ 
        message: 'Not authorized to view these reviews' 
      });
    }

    const reviews = await ReviewModel.findByReviewerId(targetUserId);
    
    res.status(200).json(reviews);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch reviews' 
    });
  }
};

export const getPendingReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    // Get all reviews for submissions the user needs to review
    const reviews = await ReviewModel.findByReviewerId(userId);
    
    res.status(200).json(reviews);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch pending reviews' 
    });
  }
};

export const approveSubmission = async (req: Request, res: Response) => {
  try {
    const { submission_id } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    if (!submission_id) {
      return res.status(400).json({ 
        message: 'Submission ID is required' 
      });
    }

    // Check if submission exists
    const submission = await SubmissionModel.findById(submission_id);
    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    // Check if user is an admin or member of the project
    const isMember = await ProjectModel.isMember(submission.project_id, userId);
    if (!isMember) {
      return res.status(403).json({ 
        message: 'Not authorized to approve this submission' 
      });
    }

    // Update submission status to approved
    const updatedSubmission = await SubmissionModel.updateStatus(submission_id, 'approved');
    
    res.status(200).json({
      message: 'Submission approved successfully',
      submission: updatedSubmission
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to approve submission' 
    });
  }
};

export const rejectSubmission = async (req: Request, res: Response) => {
  try {
    const { submission_id, reason } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    if (!submission_id) {
      return res.status(400).json({ 
        message: 'Submission ID is required' 
      });
    }

    // Check if submission exists
    const submission = await SubmissionModel.findById(submission_id);
    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    // Check if user is an admin or member of the project
    const isMember = await ProjectModel.isMember(submission.project_id, userId);
    if (!isMember) {
      return res.status(403).json({ 
        message: 'Not authorized to reject this submission' 
      });
    }

    // Update submission status to rejected
    const updatedSubmission = await SubmissionModel.updateStatus(submission_id, 'rejected');
    
    res.status(200).json({
      message: 'Submission rejected successfully',
      submission: updatedSubmission,
      reason
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to reject submission' 
    });
  }
};
