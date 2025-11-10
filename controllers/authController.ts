
// import { Request, Response } from 'express';
// import { validationResult } from 'express-validator';
// import { User, IUser } from '../models/userModel';

// export const authController = {
//   // Register a new user
//   register: async (req: Request, res: Response) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });

//     }

//     try {

//       const { name, email, password } = req.body;

//       // Check if user already exists
//       const existingUser = await User.findByEmail(email);
//       if (existingUser) {
//         return res.status(400).json({ message: 'User already exists with this email' });
//       }

//       // Create new user
//       const newUser = await User.create({
//         name,
//         email,
//         password,
//         full_name: req.body.full_name,
//       });

//       // Generate JWT token
//       const token = User.generateToken(newUser);

//       // Remove password from response
//       const { password: _, ...userWithoutPassword } = newUser;

//       res.status(201).json({
//         message: 'User registered successfully',
//         user: userWithoutPassword,
//         token
//       });
//     } catch (error: unknown) {
//       console.error('Registration error:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//       res.status(500).json({ 
//         message: 'Error registering user', 
//         error: errorMessage 
//       });
//     }
//   },

//   // Login user
//   login: async (req: Request, res: Response) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const { email, password } = req.body;

//       // Check if user exists
//       const user = await User.findByEmail(email);
//       if (!user) {
//         return res.status(401).json({ message: 'Invalid credentials' });
//       }

//       // Verify password
//       const isMatch = await User.verifyPassword(password, user.password);
//       if (!isMatch) {
//         return res.status(401).json({ message: 'Invalid credentials' });
//       }

//       // Generate JWT token
//       const token = User.generateToken(user);

//       // Remove password from response
//       const { password: _, ...userWithoutPassword } = user;

//       res.json({
//         message: 'Login successful',
//         user: userWithoutPassword,
//         token
//       });
//     } catch (error: unknown) {
//       console.error('Login error:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//       res.status(500).json({ 
//         message: 'Error logging in', 
//         error: errorMessage 
//       });
//     }
//   },

//   // Get current user
//   getMe: async (req: Request, res: Response) => {
//     try {
//       // req.user is set by the auth middleware
//       const user = await User.findById((req as any).user.id);
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
//       res.json(user);
//     } catch (error: unknown) {
//       console.error('Get me error:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//       res.status(500).json({ 
//         message: 'Error fetching user', 
//         error: errorMessage 
//       });
//     }
//   }
// };

// export default authController;



import { Request, Response } from 'express';
import { createUser, getUserByEmail, getUserById, getUserByName as findUserByName, updateUser as updateUserData, deleteUser as deleteUserData } from '../service/authService';



export const createNewUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    const user = await createUser({ name, email, password });
    console.log(user);
    res.status(201).json(user);
  }
  catch (error) {
    res.status(404).json(error)
  }

};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
  } catch (error) {
    res.status(404).json(error)
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserById(parseInt(id));
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json(error)
  }
};

export const getUserByName = async (req: Request, res: Response) => { 
  try {
    const { name } = req.params;
    const user = await findUserByName(name);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json(error)
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  try {
    const user = await updateUserData(parseInt(id), { name, email, password });
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json(error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await deleteUserData(parseInt(id));
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json(error)
  }
};