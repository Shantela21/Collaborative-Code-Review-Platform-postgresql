import { query } from './config/database';

async function checkProjectMembersTable() {
  try {
    console.log('🔍 Checking project_members table structure...');
    
    // Check if table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'project_members'
      )
    `;
    const tableResult = await query(tableCheckQuery);
    const tableExists = tableResult.rows[0].exists;
    
    console.log(`📋 project_members table exists: ${tableExists}`);
    
    if (!tableExists) {
      console.log('❌ project_members table missing, creating it...');
      
      const createTableQuery = `
        CREATE TABLE project_members (
          id SERIAL PRIMARY KEY,
          project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role VARCHAR(50) DEFAULT 'reviewer',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(project_id, user_id)
        );
      `;
      await query(createTableQuery);
      console.log('✅ project_members table created');
    }
    
    // Check table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name='project_members'
      ORDER BY ordinal_position
    `;
    const structureResult = await query(structureQuery);
    
    console.log('\n📋 project_members table structure:');
    structureResult.rows.forEach((row: any) => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable} ${row.column_default || ''}`);
    });
    
    // Check if there are any members
    const countQuery = 'SELECT COUNT(*) as count FROM project_members';
    const countResult = await query(countQuery);
    const memberCount = countResult.rows[0].count;
    
    console.log(`\n📊 Total project members: ${memberCount}`);
    
    if (memberCount > 0) {
      const sampleQuery = 'SELECT * FROM project_members LIMIT 5';
      const sampleResult = await query(sampleQuery);
      
      console.log('\n📋 Sample project members:');
      sampleResult.rows.forEach((row: any) => {
        console.log(`  Project ${row.project_id}, User ${row.user_id}, Role: ${row.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking project_members table:', error);
  }
}

checkProjectMembersTable();
