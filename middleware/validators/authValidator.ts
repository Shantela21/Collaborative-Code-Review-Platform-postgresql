import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .notEmpty().withMessage('name is required')
    .isLength({ min: 3 }).withMessage('name must be at least 3 characters long')
    .trim()
    .escape(),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please include a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('full_name')
    .optional()
    .trim()
    .escape()
];

export const loginValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please include a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
];
