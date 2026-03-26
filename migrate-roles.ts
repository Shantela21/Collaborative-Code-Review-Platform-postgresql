import { query } from './config/database';

async function migrateUserRoles() {
  try {
    console.log('🔄 Migrating user roles to new system...');
    
    // Update all users with 'developer' role to 'reviewer'
    const updateDeveloperQuery = `
      UPDATE users 
      SET role = 'reviewer' 
      WHERE role = 'developer'
    `;
    const result1 = await query(updateDeveloperQuery);
    console.log(`✅ Updated ${result1.rowCount || 0} users from 'developer' to 'reviewer'`);
    
    // Update all users with 'admin' role to 'submitter'
    const updateAdminQuery = `
      UPDATE users 
      SET role = 'submitter' 
      WHERE role = 'admin'
    `;
    const result2 = await query(updateAdminQuery);
    console.log(`✅ Updated ${result2.rowCount || 0} users from 'admin' to 'submitter'`);
    
    // Update any users with 'member' role to 'reviewer'
    const updateMemberQuery = `
      UPDATE users 
      SET role = 'reviewer' 
      WHERE role = 'member'
    `;
    const result3 = await query(updateMemberQuery);
    console.log(`✅ Updated ${result3.rowCount || 0} users from 'member' to 'reviewer'`);
    
    // Set default role for any users with NULL role
    const updateNullQuery = `
      UPDATE users 
      SET role = 'reviewer' 
      WHERE role IS NULL
    `;
    const result4 = await query(updateNullQuery);
    console.log(`✅ Updated ${result4.rowCount || 0} users with NULL role to 'reviewer'`);
    
    // Show current role distribution
    const roleCountQuery = `
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role
    `;
    const roleCounts = await query(roleCountQuery);
    
    console.log('\n📊 Current user role distribution:');
    roleCounts.rows.forEach(row => {
      console.log(`  ${row.role}: ${row.count} users`);
    });
    
    console.log('\n✅ User role migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateUserRoles();
