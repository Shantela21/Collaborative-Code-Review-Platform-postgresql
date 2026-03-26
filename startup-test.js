// Startup script with better error handling
require('dotenv').config();

async function startupTest() {
  console.log('🔧 Testing server startup...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_USER:', process.env.DB_USER ? 'Set' : 'Missing');
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Set' : 'Missing');
  console.log('PORT:', process.env.PORT);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
  
  try {
    // Test database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('\n🔍 Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log('Current time:', result.rows[0].now);
    client.release();
    await pool.end();
    
    console.log('\n🚀 All checks passed! Try starting the server:');
    console.log('npm run dev');
    
  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message);
    console.error('\n💡 Solutions:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check database name exists');
    console.error('3. Verify credentials in .env file');
    console.error('4. Create database: createdb postgres');
  }
}

startupTest();
