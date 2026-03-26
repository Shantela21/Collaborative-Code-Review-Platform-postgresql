import { query } from '../config/database';

export async function addCreatedByToProjectsTable(): Promise<void> {
  try {
    console.log('🔧 Checking and fixing projects table structure...');
    
    // Check if created_by column exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='projects' AND column_name='created_by'
    `;
    const result = await query(checkColumnQuery);
    
    if (result.rows.length === 0) {
      console.log('❌ created_by column missing, adding it...');
      
      try {
        // Add created_by column if it doesn't exist
        const alterTableQuery = `
          ALTER TABLE projects 
          ADD COLUMN created_by INTEGER REFERENCES users(id) NOT NULL
        `;
        await query(alterTableQuery);
        console.log('✅ created_by column added to projects table');
      } catch (error: any) {
        console.log('⚠️  Could not add created_by column with NOT NULL constraint, trying without...');
        const alterTableQuery2 = `
          ALTER TABLE projects 
          ADD COLUMN created_by INTEGER REFERENCES users(id)
        `;
        await query(alterTableQuery2);
        console.log('✅ created_by column added (nullable) to projects table');
      }
      
      // Add index for created_by column
      try {
        const indexQuery = `
          CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by)
        `;
        await query(indexQuery);
      } catch (error) {
        console.log('⚠️  Index creation failed, but column was added');
      }
    } else {
      console.log('✅ created_by column already exists in projects table');
    }
    
    // Check if status column exists
    const checkStatusQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='projects' AND column_name='status'
    `;
    const statusResult = await query(checkStatusQuery);
    
    if (statusResult.rows.length === 0) {
      console.log('❌ status column missing, adding it...');
      
      try {
        const addStatusQuery = `
          ALTER TABLE projects 
          ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active'
        `;
        await query(addStatusQuery);
        console.log('✅ status column added to projects table');
      } catch (error: any) {
        console.log('⚠️  Could not add status column with NOT NULL constraint, trying without...');
        const addStatusQuery2 = `
          ALTER TABLE projects 
          ADD COLUMN status VARCHAR(50) DEFAULT 'active'
        `;
        await query(addStatusQuery2);
        console.log('✅ status column added (nullable) to projects table');
      }
    } else {
      console.log('✅ status column already exists in projects table');
    }
    
    // Check if updated_at column exists
    const checkUpdatedAtQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='projects' AND column_name='updated_at'
    `;
    const updatedAtResult = await query(checkUpdatedAtQuery);
    
    if (updatedAtResult.rows.length === 0) {
      console.log('❌ updated_at column missing, adding it...');
      
      try {
        const addUpdatedAtQuery = `
          ALTER TABLE projects 
          ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `;
        await query(addUpdatedAtQuery);
        console.log('✅ updated_at column added to projects table');
      } catch (error: any) {
        console.log('⚠️  Could not add updated_at column with default, trying without...');
        const addUpdatedAtQuery2 = `
          ALTER TABLE projects 
          ADD COLUMN updated_at TIMESTAMP
        `;
        await query(addUpdatedAtQuery2);
        console.log('✅ updated_at column added (no default) to projects table');
      }
    } else {
      console.log('✅ updated_at column already exists in projects table');
    }
    
    console.log('✅ Projects table structure check completed');
    
  } catch (error) {
    console.error('❌ Error updating projects table:', error);
    console.log('💡 You may need to manually run the SQL fix');
  }
}
