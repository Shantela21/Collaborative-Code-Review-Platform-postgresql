import { query } from '../config/database';
import { Project, ProjectMember } from '../types';

export interface CreateProjectInput {
  title: string;
  description?: string;
  created_by: number;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
}

// Project CRUD operations
export const createProjectDB = async (data: CreateProjectInput) => {
  const { title, description, created_by } = data;
  const { rows } = await query(
    'INSERT INTO projects (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
    [title, description, created_by]
  );
  return rows[0];
};

export const getAllProjectsDB = async (userId: number) => {
  const { rows } = await query(
    `SELECT p.* FROM projects p
     JOIN project_members pm ON p.id = pm.project_id
     WHERE pm.user_id = $1
     ORDER BY p.updated_at DESC`,
    [userId]
  );
  return rows;
};

export const getProjectByIdDB = async (id: number, userId: number) => {
  const { rows } = await query(
    `SELECT p.* FROM projects p
     JOIN project_members pm ON p.id = pm.project_id
     WHERE p.id = $1 AND pm.user_id = $2`,
    [id, userId]
  );
  return rows[0];
};

export const updateProjectDB = async (id: number, data: UpdateProjectInput) => {
  const { title, description } = data;
  const { rows } = await query(
    `UPDATE projects 
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [title, description, id]
  );
  return rows[0];
};

export const deleteProjectDB = async (id: number) => {
  const { rowCount } = await query('DELETE FROM projects WHERE id = $1', [id]);
  return rowCount !== null && rowCount > 0;
};

// Project Member operations
export const addProjectMemberDB = async (projectId: number, userId: number, role: string = 'member') => {
  const { rows } = await query(
    `INSERT INTO project_members (project_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, user_id) 
     DO UPDATE SET role = EXCLUDED.role
     RETURNING *`,
    [projectId, userId, role]
  );
  return rows[0];
};

export const removeProjectMemberDB = async (projectId: number, userId: number) => {
  const { rowCount } = await query(
    'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return rowCount !== null && rowCount > 0;
};

export const getProjectMembersDB = async (projectId: number) => {
  const { rows } = await query(
    `SELECT u.id, u.name, u.email, pm.role, pm.created_at as member_since
     FROM project_members pm
     JOIN users u ON pm.user_id = u.id
     WHERE pm.project_id = $1`,
    [projectId]
  );
  return rows;
};

export const getProjectMemberDB = async (projectId: number, userId: number) => {
  const { rows } = await query(
    'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return rows[0];
};
