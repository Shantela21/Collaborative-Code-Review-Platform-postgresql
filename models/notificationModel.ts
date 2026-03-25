import { Pool } from 'pg';
import { pool } from '../config/database';

export interface Notification {
  id?: number;
  user_id: number;
  title: string;
  message: string;
  type: 'submission' | 'comment' | 'review' | 'project';
  read: boolean;
  related_id?: number;
  created_at?: Date;
}

export class NotificationModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(notification: Omit<Notification, 'id' | 'created_at' | 'read'>): Promise<Notification> {
    const query = `
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      notification.user_id,
      notification.title,
      notification.message,
      notification.type,
      notification.related_id
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findByUserId(userId: number, limit = 50, offset = 0): Promise<Notification[]> {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await this.pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  async findUnreadByUserId(userId: number): Promise<Notification[]> {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 AND read = FALSE 
      ORDER BY created_at DESC
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const query = `
      UPDATE notifications 
      SET read = TRUE 
      WHERE id = $1 AND user_id = $2
    `;
    const result = await this.pool.query(query, [notificationId, userId]);
    return (result.rowCount || 0) > 0;
  }

  async markAllAsRead(userId: number): Promise<number> {
    const query = `
      UPDATE notifications 
      SET read = TRUE 
      WHERE user_id = $1 AND read = FALSE
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rowCount || 0;
  }

  async delete(notificationId: number, userId: number): Promise<boolean> {
    const query = `
      DELETE FROM notifications 
      WHERE id = $1 AND user_id = $2
    `;
    const result = await this.pool.query(query, [notificationId, userId]);
    return (result.rowCount || 0) > 0;
  }

  async getUnreadCount(userId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = $1 AND read = FALSE
    `;
    const result = await this.pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  static async createNotificationTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        related_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
    `;
    await pool.query(query);
  }
}
