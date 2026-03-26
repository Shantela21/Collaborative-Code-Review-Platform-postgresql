import { query } from './config/database';

async function fixRemainingUser() {
  try {
    console.log('🔧 Fixing remaining user role...');
    
    // Update the user with 'user' role to 'reviewer'
    const updateUserQuery = `
      UPDATE users 
      SET role = 'reviewer' 
      WHERE role = 'user'
    `;
    const result = await query(updateUserQuery);
    console.log(`✅ Updated ${result.rowCount || 0} users from 'user' to 'reviewer'`);
    
    // Show final role distribution
    const roleCountQuery = `
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role
    `;
    const roleCounts = await query(roleCountQuery);
    
    console.log('\n📊 Final user role distribution:');
    roleCounts.rows.forEach((row: any) => {
      console.log(`  ${row.role}: ${row.count} users`);
    });
    
    console.log('\n✅ All user roles are now correct!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixRemainingUser();
