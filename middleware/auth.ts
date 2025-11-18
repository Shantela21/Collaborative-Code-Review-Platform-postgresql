import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../service/authService';
import { UserModel } from '../models/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'No token, authorization denied' 
      });
    }

    const decoded = verifyToken(token);
    
    const user = await UserModel.findById(decoded.id);
    
    if (!user || !user.id) {
      return res.status(401).json({ 
        message: 'User not found' 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user'
    };
    next();
  } catch (error: any) {
    if (error.message === 'Invalid token') {
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during authentication' 
    });
  }
};

export const admin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized as admin' 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error during authorization' 
    });
  }
};
