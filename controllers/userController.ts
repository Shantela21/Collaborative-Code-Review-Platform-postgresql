import { Request, Response } from 'express';
import { deleteUserDB, getAllUsersDB, getUserByIdDB, updateUserDB } from '../service/userService';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const users = await getAllUsersDB(limit, offset);
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch users' 
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID' 
      });
    }

    const user = await getUserByIdDB(userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch user' 
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { name, email, password } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID' 
      });
    }

    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to update this user' 
      });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ 
          message: 'Password must be at least 6 characters long' 
        });
      }
      updates.password = password;
    }

    const user = await updateUserDB(userId, updates);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to update user' 
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID' 
      });
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to delete users' 
      });
    }

    if (req.user?.id === userId) {
      return res.status(400).json({ 
        message: 'Cannot delete your own account' 
      });
    }

    const deleted = await deleteUserDB(userId);
    
    if (!deleted) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      message: 'User deleted successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Failed to delete user' 
    });
  }
};