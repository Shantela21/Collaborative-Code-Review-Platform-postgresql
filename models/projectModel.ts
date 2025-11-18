import { query } from '../config/database';

export interface Project {
  id?: number;
  title: string;
  description?: string;
  created_by: number;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProjectWithMembers extends Project {
  members?: ProjectMember[];
}

export interface ProjectMember {
  id?: number;
  project_id: number;
  user_id: number;
  role: string;
  created_at?: Date;
}

export class ProjectModel {
  static async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const text = `
      INSERT INTO projects (title, description, created_by, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, description, created_by, status, created_at, updated_at
    `;
    const values = [
      project.title,
      project.description || null,
      project.created_by,
      project.status || 'active'
    ];
    const result = await query(text, values);
    return result.rows[0];
  }

  static async findById(id: number): Promise<Project | null> {
    const text = `
      SELECT id, title, description, created_by, status, created_at, updated_at
      FROM projects
      WHERE id = $1
    `;
    const result = await query(text, [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: number): Promise<Project[]> {
    const text = `
      SELECT p.id, p.title, p.description, p.created_by, p.status, p.created_at, p.updated_at
      FROM projects p
      WHERE p.created_by = $1
      ORDER BY p.created_at DESC
    `;
    const result = await query(text, [userId]);
    return result.rows;
  }

  static async getAll(limit = 50, offset = 0): Promise<Project[]> {
    const text = `
      SELECT id, title, description, created_by, status, created_at, updated_at
      FROM projects
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await query(text, [limit, offset]);
    return result.rows;
  }

  static async update(id: number, updates: Partial<Omit<Project, 'id' | 'created_by' | 'created_at'>>): Promise<Project | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.title) {
      fields.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.status) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const text = `
      UPDATE projects
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, description, created_by, status, created_at, updated_at
    `;

    const result = await query(text, values);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const text = 'DELETE FROM projects WHERE id = $1';
    const result = await query(text, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async addMember(projectId: number, userId: number, role = 'member'): Promise<ProjectMember> {
    const text = `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3
      RETURNING id, project_id, user_id, role, created_at
    `;
    const result = await query(text, [projectId, userId, role]);
    return result.rows[0];
  }

  static async removeMember(projectId: number, userId: number): Promise<boolean> {
    const text = 'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2';
    const result = await query(text, [projectId, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getMembers(projectId: number): Promise<ProjectMember[]> {
    const text = `
      SELECT pm.id, pm.project_id, pm.user_id, pm.role, pm.created_at,
             u.name, u.email
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
      ORDER BY pm.created_at ASC
    `;
    const result = await query(text, [projectId]);
    return result.rows;
  }

  static async getUserProjects(userId: number): Promise<Project[]> {
    const text = `
      SELECT DISTINCT p.id, p.title, p.description, p.created_by, p.status, p.created_at, p.updated_at
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.created_by = $1 OR pm.user_id = $1
      ORDER BY p.created_at DESC
    `;
    const result = await query(text, [userId]);
    return result.rows;
  }

  static async isMember(projectId: number, userId: number): Promise<boolean> {
    const text = `
      SELECT 1 FROM project_members 
      WHERE project_id = $1 AND user_id = $2
      UNION
      SELECT 1 FROM projects 
      WHERE id = $1 AND created_by = $2
    `;
    const result = await query(text, [projectId, userId]);
    return result.rows.length > 0;
  }
}