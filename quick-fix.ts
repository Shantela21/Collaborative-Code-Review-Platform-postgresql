// Quick fix for missing updated_at column
import { query } from './config/database';

async function quickFix() {
  try {
    console.log('🔧 Quick fixing missing updated_at column...');
    
    // Add updated_at column if it doesn't exist
    const addUpdatedAtQuery = `
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `;
    
    await query(addUpdatedAtQuery);
    console.log('✅ updated_at column added successfully!');
    
    // Verify the fix
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='projects' AND column_name='updated_at'
    `;
    const result = await query(checkQuery);
    
    if (result.rows.length > 0) {
      console.log('✅ updated_at column now exists in projects table');
    } else {
      console.log('❌ updated_at column still missing');
    }
    
  } catch (error) {
    console.error('❌ Quick fix failed:', (error as any).message);
    console.log('💡 Restart the server to run the automatic fix');
  }
}

quickFix();
