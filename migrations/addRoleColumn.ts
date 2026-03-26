import { query } from '../config/database';

export async function addRoleToUsersTable(): Promise<void> {
  try {
    // Check if role column exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='role'
    `;
    const result = await query(checkColumnQuery);
    
    if (result.rows.length === 0) {
      // Add role column if it doesn't exist
      const alterTableQuery = `
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) DEFAULT 'reviewer'
      `;
      await query(alterTableQuery);
      
      // Update existing users to have default role
      const updateQuery = `
        UPDATE users SET role = 'reviewer' WHERE role IS NULL
      `;
      await query(updateQuery);
      
      // Add index for role column
      const indexQuery = `
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
      `;
      await query(indexQuery);
      
      console.log('Role column added to users table');
    } else {
      console.log('Role column already exists in users table');
    }
  } catch (error) {
    console.error('Error adding role column to users table:', error);
  }
}
