import { query } from '../config/database';

export interface Comment {
  id?: number;
  content: string;
  submission_id: number;
  user_id: number;
  parent_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CommentWithDetails extends Comment {
  user_name?: string;
  user_email?: string;
  replies?: CommentWithDetails[];
}

export class CommentModel {
  static async create(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<Comment> {
    const text = `
      INSERT INTO comments (content, submission_id, user_id, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, content, submission_id, user_id, parent_id, created_at, updated_at
    `;
    const values = [
      comment.content,
      comment.submission_id,
      comment.user_id,
      comment.parent_id || null
    ];
    const result = await query(text, values);
    return result.rows[0];
  }

  static async findById(id: number): Promise<Comment | null> {
    const text = `
      SELECT id, content, submission_id, user_id, parent_id, created_at, updated_at
      FROM comments
      WHERE id = $1
    `;
    const result = await query(text, [id]);
    return result.rows[0] || null;
  }

  static async findBySubmissionId(submissionId: number, includeReplies = true): Promise<CommentWithDetails[]> {
    if (includeReplies) {
      const text = `
        WITH RECURSIVE comment_tree AS (
          SELECT 
            c.id, c.content, c.submission_id, c.user_id, c.parent_id, 
            c.created_at, c.updated_at,
            u.name as user_name, u.email as user_email,
            0 as level
          FROM comments c
          JOIN users u ON c.user_id = u.id
          WHERE c.submission_id = $1 AND c.parent_id IS NULL
          
          UNION ALL
          
          SELECT 
            c.id, c.content, c.submission_id, c.user_id, c.parent_id,
            c.created_at, c.updated_at,
            u.name as user_name, u.email as user_email,
            ct.level + 1
          FROM comments c
          JOIN users u ON c.user_id = u.id
          JOIN comment_tree ct ON c.parent_id = ct.id
          WHERE c.submission_id = $1
        )
        SELECT * FROM comment_tree
        ORDER BY created_at ASC
      `;
      const result = await query(text, [submissionId]);
      return this.buildCommentTree(result.rows);
    } else {
      const text = `
        SELECT c.id, c.content, c.submission_id, c.user_id, c.parent_id, c.created_at, c.updated_at,
               u.name as user_name, u.email as user_email
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.submission_id = $1
        ORDER BY c.created_at ASC
      `;
      const result = await query(text, [submissionId]);
      return result.rows;
    }
  }

  static async findByUserId(userId: number, limit = 50, offset = 0): Promise<CommentWithDetails[]> {
    const text = `
      SELECT c.id, c.content, c.submission_id, c.user_id, c.parent_id, c.created_at, c.updated_at,
             u.name as user_name, u.email as user_email,
             s.title as submission_title
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN submissions s ON c.submission_id = s.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(text, [userId, limit, offset]);
    return result.rows;
  }

  static async update(id: number, content: string): Promise<Comment | null> {
    const text = `
      UPDATE comments
      SET content = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, content, submission_id, user_id, parent_id, created_at, updated_at
    `;
    const result = await query(text, [content, id]);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const text = 'DELETE FROM comments WHERE id = $1';
    const result = await query(text, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async deleteBySubmissionId(submissionId: number): Promise<boolean> {
    const text = 'DELETE FROM comments WHERE submission_id = $1';
    const result = await query(text, [submissionId]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getReplies(parentId: number): Promise<CommentWithDetails[]> {
    const text = `
      SELECT c.id, c.content, c.submission_id, c.user_id, c.parent_id, c.created_at, c.updated_at,
             u.name as user_name, u.email as user_email
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.parent_id = $1
      ORDER BY c.created_at ASC
    `;
    const result = await query(text, [parentId]);
    return result.rows;
  }

  static async countBySubmission(submissionId: number): Promise<number> {
    const text = 'SELECT COUNT(*) as count FROM comments WHERE submission_id = $1';
    const result = await query(text, [submissionId]);
    return parseInt(result.rows[0].count);
  }

  private static buildCommentTree(comments: CommentWithDetails[]): CommentWithDetails[] {
    const commentMap = new Map();
    const rootComments: CommentWithDetails[] = [];

    comments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    comments.forEach(comment => {
      if (comment.parent_id && commentMap.has(comment.parent_id)) {
        const parent = commentMap.get(comment.parent_id);
        parent.replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  static async getCommentThread(commentId: number): Promise<CommentWithDetails | null> {
    const text = `
      WITH RECURSIVE comment_thread AS (
        SELECT 
          c.id, c.content, c.submission_id, c.user_id, c.parent_id,
          c.created_at, c.updated_at,
          u.name as user_name, u.email as user_email,
          0 as level
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
        
        UNION ALL
        
        SELECT 
          c.id, c.content, c.submission_id, c.user_id, c.parent_id,
          c.created_at, c.updated_at,
          u.name as user_name, u.email as user_email,
          ct.level + 1
        FROM comments c
        JOIN users u ON c.user_id = u.id
        JOIN comment_thread ct ON c.parent_id = ct.id
        WHERE ct.level = 0
      )
      SELECT * FROM comment_thread
      ORDER BY created_at ASC
    `;
    const result = await query(text, [commentId]);
    
    if (result.rows.length === 0) return null;
    
    const thread = this.buildCommentTree(result.rows);
    return thread[0] || null;
  }
}