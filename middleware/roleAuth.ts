import { Request, Response, NextFunction } from 'express';

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Authentication required' 
        });
      }

      if (!allowedRoles.includes(req.user.role || '')) {
        return res.status(403).json({ 
          message: `Not authorized. Required roles: ${allowedRoles.join(', ')}` 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error during authorization' 
      });
    }
  };
};

// Specific role middleware functions
export const requireSubmitter = authorize('submitter');
export const requireReviewer = authorize('reviewer');
export const requireSubmitterOrReviewer = authorize('submitter', 'reviewer');

// Check if user is project member with specific role
export const requireProjectRole = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Authentication required' 
        });
      }

      const projectId = parseInt(req.params.id);
      if (!projectId) {
        return res.status(400).json({ 
          message: 'Project ID required' 
        });
      }

      // This would need to be implemented to check project membership
      // For now, we'll use the user's global role
      if (req.user.role !== requiredRole) {
        return res.status(403).json({ 
          message: `Not authorized. Required role: ${requiredRole}` 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error during authorization' 
      });
    }
  };
};
