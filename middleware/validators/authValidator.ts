import { body } from 'express-validator';

export const registerValidator = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
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
    .escape(),

  body('bio')
    .optional()
    .trim()
    .escape(),

  body('avatar_url')
    .optional()
    .isURL().withMessage('Avatar must be a valid URL')
];

export const loginValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please include a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
];
