// import { Router } from 'express';
// import { authController } from '../controllers/authController';
// import { registerValidator, loginValidator } from '../middleware/validators/authValidator';
// import { auth } from '../middleware/auth';

// const router = Router();

// // @route   POST /api/auth/register
// // @desc    Register a new user
// // @access  Public
// router.post('/register', registerValidator, authController.register);

// // @route   POST /api/auth/login
// // @desc    Login user and get token
// // @access  Public
// router.post('/login', loginValidator, authController.login);

// // @route   GET /api/auth/me
// // @desc    Get current user's profile
// // @access  Private
// router.get('/me', auth, authController.getMe);

// export default router;



import { get } from "http";
import { createNewUser, getMe, login } from "../controllers/authController";
import { Router } from "express";

const router = Router()

router.post('/register', createNewUser)
router.get('/login', login)
router.get('/me', getMe)
router.put('/update', getMe)
router.delete('/delete', getMe)



export default router