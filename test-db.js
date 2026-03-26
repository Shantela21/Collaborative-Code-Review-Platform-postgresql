import { query } from './config/database';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const result = await query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log('Current time:', result.rows[0].now);
    
    // Check if users table exists
    const userTableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);
    console.log('📋 Users table exists:', userTableCheck.rows[0].exists);
    
    // Check if projects table exists
    const projectTableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
      )
    `);
    console.log('📁 Projects table exists:', projectTableCheck.rows[0].exists);
    
    // Check if role column exists in users table
    const roleColumnCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
      )
    `);
    console.log('👤 Role column exists:', roleColumnCheck.rows[0].exists);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testDatabaseConnection();
