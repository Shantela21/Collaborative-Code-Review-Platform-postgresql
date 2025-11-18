import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserWithoutPassword {
  id?: number;
  name: string;
  email: string;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class UserModel {
  static async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<UserWithoutPassword> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const text = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `;
    const values = [user.name, user.email, hashedPassword, user.role || 'developer'];
    const result = await query(text, values);
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const text = 'SELECT * FROM users WHERE email = $1';
    const result = await query(text, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<UserWithoutPassword | null> {
    const text = `
      SELECT id, name, email, role, created_at, updated_at 
      FROM users 
      WHERE id = $1
    `;
    const result = await query(text, [id]);
    return result.rows[0] || null;
  }

  static async update(id: number, updates: Partial<Omit<User, 'id' | 'password' | 'created_at'>>): Promise<UserWithoutPassword | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.email) {
      fields.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }
    if (updates.role) {
      fields.push(`role = $${paramIndex++}`);
      values.push(updates.role);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const text = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, role, created_at, updated_at
    `;

    const result = await query(text, values);
    return result.rows[0] || null;
  }

  static async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const text = `
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    const result = await query(text, [hashedPassword, id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const text = 'DELETE FROM users WHERE id = $1';
    const result = await query(text, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async comparePassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async getAll(limit = 50, offset = 0): Promise<UserWithoutPassword[]> {
    const text = `
      SELECT id, name, email, role, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await query(text, [limit, offset]);
    return result.rows;
  }
}
