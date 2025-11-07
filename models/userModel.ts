import { query } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface IUser {
  id?: number;
  username: string;
  email: string;
  password: string;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  created_at?: Date;
  updated_at?: Date;
  role?: string;
}

export class User {
  // Create a new user
  static async create(user: Omit<IUser, 'id' | 'created_at' | 'updated_at'>): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const result = await query(
      `INSERT INTO users (username, email, password, full_name, bio, avatar_url) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, email, full_name, bio, avatar_url, created_at, updated_at, role`,
      [
        user.username, 
        user.email, 
        hashedPassword, 
        user.full_name || null, 
        user.bio || null, 
        user.avatar_url || null
      ]
    );
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id: number): Promise<IUser | null> {
    const result = await query(
      'SELECT id, username, email, full_name, bio, avatar_url, created_at, updated_at, role FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<IUser | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  // Update user
  static async update(id: number, updates: Partial<IUser>): Promise<IUser | null> {
    const fields: string[] = [];
    const values: (string | number | null | Date)[] = [];
    let paramCount = 1;

    // Build the dynamic query
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'password' && value) {
        const hashedPassword = await bcrypt.hash(String(value), 10);
        fields.push(`${key} = $${paramCount}`);
        values.push(hashedPassword);
        paramCount++;
      } else if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const queryText = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${paramCount} 
      RETURNING id, username, email, full_name, bio, avatar_url, created_at, updated_at, role
    `;

    const result = await query(queryText, values);
    return result.rows[0] || null;
  }

  // Delete user
  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Generate JWT token
  static generateToken(user: IUser): string {
  if (!user.id) {
    throw new Error('User ID is required to generate token');
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role || 'user'
  };

  return jwt.sign(
    payload,
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
}


  // Verify password
  static async verifyPassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Query helper method
  static async query(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
    const result = await query(text, params);
    return {
      rows: result.rows || [],
      rowCount: result.rowCount || 0
    };
  }
}