import { Request, Response } from 'express';
import { createUser, getUserByEmail, generateToken } from '../service/authService';
import { UserModel } from '../models/userModel';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const user = await createUser({ name, email, password });
    const token = generateToken(user);

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: error.message || 'Registration failed' 
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    const user = await getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    const isPasswordValid = await UserModel.comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Login failed' 
    });
  }
};
