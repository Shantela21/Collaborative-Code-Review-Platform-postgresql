export interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: 'admin' | 'member';
  created_at: Date;
}

export interface ProjectWithMembers extends Project {
  members: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    member_since: Date;
  }>;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role?: string;
      };
    }
  }
}
