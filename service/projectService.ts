import { Project, ProjectMember, ProjectModel } from '../models/projectModel';
import { UserWithoutPassword, UserModel } from '../models/userModel';

export interface CreateProjectInput {
  title: string;
  description?: string;
  created_by: number;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
}

export const createProjectDB = async (data: CreateProjectInput): Promise<Project | null> => {
  return await ProjectModel.create(data);
};

export const getAllProjectsDB = async (userId: number): Promise<Project[]> => {
  return await ProjectModel.findByUserId(userId);
};

export const getProjectByIdDB = async (id: number, userId: number): Promise<Project | null> => {
  const project = await ProjectModel.findById(id);
  if (!project) return null;
  
  const isMember = await ProjectModel.isMember(id, userId);
  return isMember ? project : null;
};

export const updateProjectDB = async (id: number, data: UpdateProjectInput): Promise<Project | null> => {
  return await ProjectModel.update(id, data);
};

export const deleteProjectDB = async (id: number): Promise<boolean> => {
  return await ProjectModel.delete(id);
};

export const addProjectMemberDB = async (projectId: number, userId: number, role: string = 'member'): Promise<ProjectMember | null> => {
  return await ProjectModel.addMember(projectId, userId, role as 'admin' | 'member');
};

export const removeProjectMemberDB = async (projectId: number, userId: number): Promise<boolean> => {
  return await ProjectModel.removeMember(projectId, userId);
};

export const getProjectMembersDB = async (projectId: number): Promise<Array<UserWithoutPassword & { role: string; member_since: Date }>> => {
  const members = await ProjectModel.getMembers(projectId);
  const result = [];
  
  for (const member of members) {
    const user = await UserModel.findById(member.user_id);
    if (user && user.id && user.name && user.email) {
      result.push({
        id: user.id,
        name: user.name,
        email: user.email,
        role: member.role,
        member_since: member.created_at || new Date(),
        created_at: user.created_at,
        updated_at: user.updated_at
      });
    }
  }
  
  return result;
};

export const getProjectMemberDB = async (projectId: number, userId: number): Promise<ProjectMember | null> => {
  const members = await ProjectModel.getMembers(projectId);
  return members.find(m => m.user_id === userId) || null;
};
