import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ValidationError } from './errorHandler';

// Validation middleware helper
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ValidationError(errorMessages.join(', ')));
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

// Project validation rules
export const validateProjectCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  handleValidationErrors
];

export const validateProjectUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  handleValidationErrors
];

// Submission validation rules
export const validateSubmissionCreation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Submission title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('code')
    .notEmpty()
    .withMessage('Code content is required'),
  body('project_id')
    .isInt({ min: 1 })
    .withMessage('Valid project ID is required'),
  handleValidationErrors
];

export const validateSubmissionUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Submission title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('code')
    .optional()
    .notEmpty()
    .withMessage('Code content cannot be empty'),
  handleValidationErrors
];

export const validateSubmissionStatus = [
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'changes_requested'])
    .withMessage('Status must be one of: pending, approved, rejected, changes_requested'),
  handleValidationErrors
];

// Comment validation rules
export const validateCommentCreation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('submission_id')
    .isInt({ min: 1 })
    .withMessage('Valid submission ID is required'),
  body('parent_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid parent comment ID is required'),
  handleValidationErrors
];

export const validateCommentUpdate = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  handleValidationErrors
];

// Review validation rules
export const validateReviewCreation = [
  body('submission_id')
    .isInt({ min: 1 })
    .withMessage('Valid submission ID is required'),
  body('status')
    .isIn(['approved', 'changes_requested', 'pending'])
    .withMessage('Status must be one of: approved, changes_requested, pending'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Feedback must not exceed 2000 characters'),
  handleValidationErrors
];

export const validateReviewUpdate = [
  body('status')
    .optional()
    .isIn(['approved', 'changes_requested', 'pending'])
    .withMessage('Status must be one of: approved, changes_requested, pending'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Feedback must not exceed 2000 characters'),
  handleValidationErrors
];

// Notification validation rules
export const validateNotificationCreation = [
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('type')
    .isIn(['submission', 'comment', 'review', 'project'])
    .withMessage('Type must be one of: submission, comment, review, project'),
  body('related_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Related ID must be a valid integer'),
  handleValidationErrors
];

// Parameter validation rules
export const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required'),
  handleValidationErrors
];

export const validateProjectIdParam = [
  param('projectId')
    .isInt({ min: 1 })
    .withMessage('Valid project ID is required'),
  handleValidationErrors
];

export const validateSubmissionIdParam = [
  param('submissionId')
    .isInt({ min: 1 })
    .withMessage('Valid submission ID is required'),
  handleValidationErrors
];

// Query validation rules
export const validatePaginationQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  handleValidationErrors
];