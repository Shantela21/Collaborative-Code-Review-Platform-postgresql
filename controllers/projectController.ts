import { Request, Response } from 'express';
import { 
  createProjectDB, 
  getAllProjectsDB, 
  getProjectByIdDB, 
  updateProjectDB, 
  deleteProjectDB,
  addProjectMemberDB,
  removeProjectMemberDB,
  getProjectMembersDB,
  getProjectMemberDB
} from '../service/projectService';
import { Project, ProjectWithMembers } from '../types';

// Create a new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const project = await createProjectDB({ 
      title, 
      description, 
      created_by: userId 
    });
    
    // Add creator as admin
    await addProjectMemberDB(project.id, userId, 'admin');
    
    // Get project with members
    const projectWithMembers: ProjectWithMembers = {
      ...project,
      members: [{
        id: userId,
        name: (req.user as any)?.name || '',
        email: req.user?.email || '',
        role: 'admin',
        member_since: new Date()
      }]
    };
    
    res.status(201).json(projectWithMembers);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
};

// Get all projects for the current user
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const projects = await getAllProjectsDB(userId);
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

// Get project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const project = await getProjectByIdDB(parseInt(id), userId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get project members
    const members = await getProjectMembersDB(parseInt(id));
    
    const projectWithMembers: ProjectWithMembers = {
      ...project,
      members
    };
    
    res.json(projectWithMembers);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin of the project
    const member = await getProjectMemberDB(parseInt(id), userId);
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const updatedProject = await updateProjectDB(parseInt(id), { title, description });
    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin of the project
    const member = await getProjectMemberDB(parseInt(id), userId);
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await deleteProjectDB(parseInt(id));
    res.status(204).send();
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
};

// Add member to project
export const addProjectMember = async (req: Request, res: Response) => {
  try {
    const { id: projectId } = req.params;
    const { userId, role = 'member' } = req.body;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if current user is admin of the project
    const currentUserMember = await getProjectMemberDB(parseInt(projectId), currentUserId);
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add members to this project' });
    }

    const member = await addProjectMemberDB(parseInt(projectId), userId, role);
    res.status(201).json(member);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Error adding member to project' });
  }
};

// Remove member from project
export const removeProjectMember = async (req: Request, res: Response) => {
  try {
    const { id: projectId, userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if current user is admin of the project
    const currentUserMember = await getProjectMemberDB(parseInt(projectId), currentUserId);
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to remove members from this project' });
    }

    // Prevent removing yourself if you're the only admin
    if (parseInt(userId) === currentUserId) {
      const members = await getProjectMembersDB(parseInt(projectId));
      const adminMembers = members.filter(m => m.role === 'admin');
      if (adminMembers.length <= 1) {
        return res.status(400).json({ message: 'Cannot remove the only admin from the project' });
      }
    }

    await removeProjectMemberDB(parseInt(projectId), parseInt(userId));
    res.status(204).send();
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Error removing member from project' });
  }
};

export default {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
};
