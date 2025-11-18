import { query } from '../config/database';

export interface Review {
  id?: number;
  submission_id: number;
  reviewer_id: number;
  status: 'approved' | 'changes_requested' | 'pending';
  feedback?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ReviewWithDetails extends Review {
  submission_title?: string;
  reviewer_name?: string;
  reviewer_email?: string;
  submitter_name?: string;
}

export interface Notification {
  id?: number;
  user_id: number;
  title: string;
  message: string;
  type: 'submission' | 'comment' | 'review' | 'project';
  read?: boolean;
  related_id?: number;
  created_at?: Date;
}

export class ReviewModel {
  static async create(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
    const text = `
      INSERT INTO reviews (submission_id, reviewer_id, status, feedback)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (submission_id, reviewer_id) 
      DO UPDATE SET status = $3, feedback = $4, updated_at = CURRENT_TIMESTAMP
      RETURNING id, submission_id, reviewer_id, status, feedback, created_at, updated_at
    `;
    const values = [
      review.submission_id,
      review.reviewer_id,
      review.status,
      review.feedback || null
    ];
    const result = await query(text, values);
    return result.rows[0];
  }

  static async findById(id: number): Promise<Review | null> {
    const text = `
      SELECT id, submission_id, reviewer_id, status, feedback, created_at, updated_at
      FROM reviews
      WHERE id = $1
    `;
    const result = await query(text, [id]);
    return result.rows[0] || null;
  }

  static async findBySubmissionId(submissionId: number): Promise<ReviewWithDetails[]> {
    const text = `
      SELECT r.id, r.submission_id, r.reviewer_id, r.status, r.feedback, r.created_at, r.updated_at,
             s.title as submission_title,
             u.name as reviewer_name,
             u.email as reviewer_email,
             sub_u.name as submitter_name
      FROM reviews r
      JOIN submissions s ON r.submission_id = s.id
      JOIN users u ON r.reviewer_id = u.id
      JOIN users sub_u ON s.submitted_by = sub_u.id
      WHERE r.submission_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await query(text, [submissionId]);
    return result.rows;
  }

  static async findByReviewerId(reviewerId: number, limit = 50, offset = 0): Promise<ReviewWithDetails[]> {
    const text = `
      SELECT r.id, r.submission_id, r.reviewer_id, r.status, r.feedback, r.created_at, r.updated_at,
             s.title as submission_title,
             u.name as reviewer_name,
             u.email as reviewer_email,
             sub_u.name as submitter_name
      FROM reviews r
      JOIN submissions s ON r.submission_id = s.id
      JOIN users u ON r.reviewer_id = u.id
      JOIN users sub_u ON s.submitted_by = sub_u.id
      WHERE r.reviewer_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(text, [reviewerId, limit, offset]);
    return result.rows;
  }

  static async findByUser(userId: number, limit = 50, offset = 0): Promise<ReviewWithDetails[]> {
    const text = `
      SELECT r.id, r.submission_id, r.reviewer_id, r.status, r.feedback, r.created_at, r.updated_at,
             s.title as submission_title,
             u.name as reviewer_name,
             u.email as reviewer_email,
             sub_u.name as submitter_name
      FROM reviews r
      JOIN submissions s ON r.submission_id = s.id
      JOIN users u ON r.reviewer_id = u.id
      JOIN users sub_u ON s.submitted_by = sub_u.id
      WHERE r.reviewer_id = $1 OR s.submitted_by = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(text, [userId, limit, offset]);
    return result.rows;
  }

  static async update(id: number, updates: Partial<Omit<Review, 'id' | 'submission_id' | 'reviewer_id' | 'created_at'>>): Promise<Review | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.status) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.feedback !== undefined) {
      fields.push(`feedback = $${paramIndex++}`);
      values.push(updates.feedback);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const text = `
      UPDATE reviews
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, submission_id, reviewer_id, status, feedback, created_at, updated_at
    `;

    const result = await query(text, values);
    return result.rows[0] || null;
  }

  static async updateStatus(id: number, status: string, feedback?: string): Promise<Review | null> {
    const text = `
      UPDATE reviews
      SET status = $1, feedback = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, submission_id, reviewer_id, status, feedback, created_at, updated_at
    `;
    const result = await query(text, [status, feedback || null, id]);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const text = 'DELETE FROM reviews WHERE id = $1';
    const result = await query(text, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async approveSubmission(submissionId: number, reviewerId: number, feedback?: string): Promise<Review | null> {
    return this.create({
      submission_id: submissionId,
      reviewer_id: reviewerId,
      status: 'approved',
      feedback: feedback
    });
  }

  static async requestChanges(submissionId: number, reviewerId: number, feedback: string): Promise<Review | null> {
    return this.create({
      submission_id: submissionId,
      reviewer_id: reviewerId,
      status: 'changes_requested',
      feedback: feedback
    });
  }

  static async getSubmissionReviewHistory(submissionId: number): Promise<ReviewWithDetails[]> {
    const text = `
      SELECT r.id, r.submission_id, r.reviewer_id, r.status, r.feedback, r.created_at, r.updated_at,
             u.name as reviewer_name,
             u.email as reviewer_email
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.submission_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await query(text, [submissionId]);
    return result.rows;
  }

  static async getReviewStats(submissionId: number): Promise<{ approved: number; changes_requested: number; pending: number; total: number }> {
    const text = `
      SELECT 
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'changes_requested' THEN 1 END) as changes_requested,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(*) as total
      FROM reviews
      WHERE submission_id = $1
    `;
    const result = await query(text, [submissionId]);
    return result.rows[0];
  }

  static async hasReviewed(submissionId: number, reviewerId: number): Promise<boolean> {
    const text = 'SELECT 1 FROM reviews WHERE submission_id = $1 AND reviewer_id = $2';
    const result = await query(text, [submissionId, reviewerId]);
    return result.rows.length > 0;
  }
}

export class NotificationModel {
  static async create(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const text = `
      INSERT INTO notifications (user_id, title, message, type, read, related_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, title, message, type, read, related_id, created_at
    `;
    const values = [
      notification.user_id,
      notification.title,
      notification.message,
      notification.type,
      notification.read || false,
      notification.related_id || null
    ];
    const result = await query(text, values);
    return result.rows[0];
  }

  static async findByUserId(userId: number, limit = 50, offset = 0): Promise<Notification[]> {
    const text = `
      SELECT id, user_id, title, message, type, read, related_id, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(text, [userId, limit, offset]);
    return result.rows;
  }

  static async findUnreadByUserId(userId: number, limit = 50, offset = 0): Promise<Notification[]> {
    const text = `
      SELECT id, user_id, title, message, type, read, related_id, created_at
      FROM notifications
      WHERE user_id = $1 AND read = false
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(text, [userId, limit, offset]);
    return result.rows;
  }

  static async markAsRead(id: number): Promise<Notification | null> {
    const text = `
      UPDATE notifications
      SET read = true
      WHERE id = $1
      RETURNING id, user_id, title, message, type, read, related_id, created_at
    `;
    const result = await query(text, [id]);
    return result.rows[0] || null;
  }

  static async markAllAsRead(userId: number): Promise<boolean> {
    const text = 'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false';
    const result = await query(text, [userId]);
    return (result.rowCount ?? 0) > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const text = 'DELETE FROM notifications WHERE id = $1';
    const result = await query(text, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const text = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false';
    const result = await query(text, [userId]);
    return parseInt(result.rows[0].count);
  }

  static async createSubmissionNotification(submissionId: number, projectMembers: number[]): Promise<void> {
    const text = `
      INSERT INTO notifications (user_id, title, message, type, related_id)
      SELECT $1, 'New Submission', 
             CONCAT('A new submission "', $2, '" has been added to your project.'),
             'submission', $3
      FROM unnest($4) as user_id
      WHERE user_id != $5
    `;
    await query(text, [
      projectMembers[0],
      'New Submission',
      submissionId,
      projectMembers,
      projectMembers[0]
    ]);
  }

  static async createCommentNotification(comment: any, submissionOwnerId: number): Promise<void> {
    if (comment.user_id === submissionOwnerId) return;

    await this.create({
      user_id: submissionOwnerId,
      title: 'New Comment',
      message: `A new comment has been added to your submission.`,
      type: 'comment',
      related_id: comment.submission_id
    });
  }

  static async createReviewNotification(review: Review, submissionOwnerId: number): Promise<void> {
    if (review.reviewer_id === submissionOwnerId) return;

    const statusText = review.status === 'approved' ? 'approved' : 'requested changes for';
    
    await this.create({
      user_id: submissionOwnerId,
      title: `Submission ${statusText}`,
      message: `Your submission has been ${statusText}.`,
      type: 'review',
      related_id: review.submission_id
    });
  }
}