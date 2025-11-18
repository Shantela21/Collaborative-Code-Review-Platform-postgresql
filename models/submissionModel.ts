import { query } from '../config/database';

export interface Submission {
  id?: number;
  title: string;
  description?: string;
  code_content: string;
  project_id: number;
  submitted_by: number;
  status?: string;
  file_path?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface SubmissionWithDetails extends Submission {
  project_title?: string;
  submitter_name?: string;
  submitter_email?: string;
  comment_count?: number;
  review_count?: number;
}

export class SubmissionModel {
  static async create(submission: Omit<Submission, 'id' | 'created_at' | 'updated_at'>): Promise<Submission> {
    const text = `
      INSERT INTO submissions (title, description, code_content, project_id, submitted_by, status, file_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, description, code_content, project_id, submitted_by, status, file_path, created_at, updated_at
    `;
    const values = [
      submission.title,
      submission.description || null,
      submission.code_content,
      submission.project_id,
      submission.submitted_by,
      submission.status || 'pending',
      submission.file_path || null
    ];
    const result = await query(text, values);
    return result.rows[0];
  }

  static async findById(id: number): Promise<Submission | null> {
    const text = `
      SELECT id, title, description, code_content, project_id, submitted_by, status, file_path, created_at, updated_at
      FROM submissions
      WHERE id = $1
    `;
    const result = await query(text, [id]);
    return result.rows[0] || null;
  }

  static async findByIdWithDetails(id: number): Promise<SubmissionWithDetails | null> {
    const text = `
      SELECT s.id, s.title, s.description, s.code_content, s.project_id, s.submitted_by, 
             s.status, s.file_path, s.created_at, s.updated_at,
             p.title as project_title,
             u.name as submitter_name,
             u.email as submitter_email,
             (SELECT COUNT(*) FROM comments WHERE submission_id = s.id) as comment_count,
             (SELECT COUNT(*) FROM reviews WHERE submission_id = s.id) as review_count
      FROM submissions s
      JOIN projects p ON s.project_id = p.id
      JOIN users u ON s.submitted_by = u.id
      WHERE s.id = $1
    `;
    const result = await query(text, [id]);
    return result.rows[0] || null;
  }

  static async findByProjectId(projectId: number, limit = 50, offset = 0): Promise<SubmissionWithDetails[]> {
    const text = `
      SELECT s.id, s.title, s.description, s.code_content, s.project_id, s.submitted_by, 
             s.status, s.file_path, s.created_at, s.updated_at,
             p.title as project_title,
             u.name as submitter_name,
             u.email as submitter_email,
             (SELECT COUNT(*) FROM comments WHERE submission_id = s.id) as comment_count,
             (SELECT COUNT(*) FROM reviews WHERE submission_id = s.id) as review_count
      FROM submissions s
      JOIN projects p ON s.project_id = p.id
      JOIN users u ON s.submitted_by = u.id
      WHERE s.project_id = $1
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(text, [projectId, limit, offset]);
    return result.rows;
  }

  static async findByUserId(userId: number, limit = 50, offset = 0): Promise<SubmissionWithDetails[]> {
    const text = `
      SELECT s.id, s.title, s.description, s.code_content, s.project_id, s.submitted_by, 
             s.status, s.file_path, s.created_at, s.updated_at,
             p.title as project_title,
             u.name as submitter_name,
             u.email as submitter_email,
             (SELECT COUNT(*) FROM comments WHERE submission_id = s.id) as comment_count,
             (SELECT COUNT(*) FROM reviews WHERE submission_id = s.id) as review_count
      FROM submissions s
      JOIN projects p ON s.project_id = p.id
      JOIN users u ON s.submitted_by = u.id
      WHERE s.submitted_by = $1
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(text, [userId, limit, offset]);
    return result.rows;
  }

  static async getAll(limit = 50, offset = 0): Promise<SubmissionWithDetails[]> {
    const text = `
      SELECT s.id, s.title, s.description, s.code_content, s.project_id, s.submitted_by, 
             s.status, s.file_path, s.created_at, s.updated_at,
             p.title as project_title,
             u.name as submitter_name,
             u.email as submitter_email,
             (SELECT COUNT(*) FROM comments WHERE submission_id = s.id) as comment_count,
             (SELECT COUNT(*) FROM reviews WHERE submission_id = s.id) as review_count
      FROM submissions s
      JOIN projects p ON s.project_id = p.id
      JOIN users u ON s.submitted_by = u.id
      ORDER BY s.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await query(text, [limit, offset]);
    return result.rows;
  }

  static async update(id: number, updates: Partial<Omit<Submission, 'id' | 'project_id' | 'submitted_by' | 'created_at'>>): Promise<Submission | null> {
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
    if (updates.code_content) {
      fields.push(`code_content = $${paramIndex++}`);
      values.push(updates.code_content);
    }
    if (updates.status) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.file_path !== undefined) {
      fields.push(`file_path = $${paramIndex++}`);
      values.push(updates.file_path);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const text = `
      UPDATE submissions
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, description, code_content, project_id, submitted_by, status, file_path, created_at, updated_at
    `;

    const result = await query(text, values);
    return result.rows[0] || null;
  }

  static async updateStatus(id: number, status: string): Promise<Submission | null> {
    const text = `
      UPDATE submissions
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, title, description, code_content, project_id, submitted_by, status, file_path, created_at, updated_at
    `;
    const result = await query(text, [status, id]);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const text = 'DELETE FROM submissions WHERE id = $1';
    const result = await query(text, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getByStatus(status: string, limit = 50, offset = 0): Promise<SubmissionWithDetails[]> {
    const text = `
      SELECT s.id, s.title, s.description, s.code_content, s.project_id, s.submitted_by, 
             s.status, s.file_path, s.created_at, s.updated_at,
             p.title as project_title,
             u.name as submitter_name,
             u.email as submitter_email,
             (SELECT COUNT(*) FROM comments WHERE submission_id = s.id) as comment_count,
             (SELECT COUNT(*) FROM reviews WHERE submission_id = s.id) as review_count
      FROM submissions s
      JOIN projects p ON s.project_id = p.id
      JOIN users u ON s.submitted_by = u.id
      WHERE s.status = $1
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(text, [status, limit, offset]);
    return result.rows;
  }
}