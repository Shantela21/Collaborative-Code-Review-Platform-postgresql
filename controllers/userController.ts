// import { Request, Response } from 'express';


// export const userController = {
//   // Get all users (admin only)
//   getAllUsers: async (req: Request, res: Response) => {
//     try {
//       const result = await User.query('SELECT id, name, email, full_name, created_at, updated_at FROM users');
//       res.json(result.rows);
//     } catch (error) {
//       console.error('Get all users error:', error);
//       res.status(500).json({ message: 'Error fetching users', error: (error as Error).message });
//     }
//   },

//   // Get user by ID
//   getUserById: async (req: Request, res: Response) => {
//     try {
//       const user = await User.findById(parseInt(req.params.id));
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
//       res.json(user);
//     } catch (error) {
//       console.error('Get user by ID error:', error);
//       res.status(500).json({ message: 'Error fetching user', error: (error as Error).message });
//     }
//   },

//   // Update user
//   updateUser: async (req: Request, res: Response) => {
//     try {
//       const userId = parseInt(req.params.id);
//       const requestingUser = (req as any).user;

//       // Check if user is updating their own profile or is an admin
//       if (userId !== requestingUser.id && requestingUser.role !== 'admin') {
//         return res.status(403).json({ message: 'Not authorized to update this user' });
//       }

//       const updates: Partial<IUser> = {};
//       const allowedUpdates = ['name', 'email', 'full_name', 'password'];
      
//       // Only include fields that are in the request body and allowed to be updated
//       for (const key in req.body) {
//         if (allowedUpdates.includes(key)) {
//           (updates as any)[key] = req.body[key];
//         }
//       }

//       // If no valid updates, return error
//       if (Object.keys(updates).length === 0) {
//         return res.status(400).json({ message: 'No valid fields to update' });
//       }

//       const updatedUser = await User.update(userId, updates);
//       if (!updatedUser) {
//         return res.status(404).json({ message: 'User not found' });
//       }

//       res.json(updatedUser);
//     } catch (error) {
//       console.error('Update user error:', error);
//       res.status(500).json({ message: 'Error updating user', error: (error as Error).message });
//     }
//   },

//   // Delete user
//   deleteUser: async (req: Request, res: Response) => {
//     try {
//       const userId = parseInt(req.params.id);
//       const requestingUser = (req as any).user;

//       // Check if user is deleting their own profile or is an admin
//       if (userId !== requestingUser.id && requestingUser.role !== 'admin') {
//         return res.status(403).json({ message: 'Not authorized to delete this user' });
//       }

//       const success = await User.delete(userId);
//       if (!success) {
//         return res.status(404).json({ message: 'User not found' });
//       }

//       res.json({ message: 'User deleted successfully' });
//     } catch (error) {
//       console.error('Delete user error:', error);
//       res.status(500).json({ message: 'Error deleting user', error: (error as Error).message });
//     }
//   }
// };

// export default userController;