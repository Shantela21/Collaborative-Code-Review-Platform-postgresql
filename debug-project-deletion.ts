import { query } from './config/database';

async function debugProjectDeletion() {
  try {
    console.log('🔍 Debugging project deletion authorization...');
    
    // Get a sample project and user to test with
    const projectQuery = 'SELECT id, title, created_by FROM projects LIMIT 1';
    const projectResult = await query(projectQuery);
    
    if (projectResult.rows.length === 0) {
      console.log('❌ No projects found to test with');
      return;
    }
    
    const project = projectResult.rows[0];
    console.log(`📋 Testing with Project ID: ${project.id}, Created by: ${project.created_by}`);
    
    // Check if the creator is in project_members
    const memberQuery = `
      SELECT pm.*, u.name, u.email 
      FROM project_members pm 
      JOIN users u ON pm.user_id = u.id 
      WHERE pm.project_id = $1 AND pm.user_id = $2
    `;
    const memberResult = await query(memberQuery, [project.id, project.created_by]);
    
    console.log(`\n📋 Creator (${project.created_by}) in project_members:`, memberResult.rows.length > 0 ? 'YES' : 'NO');
    
    if (memberResult.rows.length > 0) {
      const member = memberResult.rows[0];
      console.log(`📋 Creator role in project_members: "${member.role}"`);
      console.log(`📋 Expected role: "submitter"`);
      console.log(`📋 Role matches: ${member.role === 'submitter' ? 'YES' : 'NO'}`);
    }
    
    // Check all members of this project
    const allMembersQuery = `
      SELECT pm.*, u.name, u.email 
      FROM project_members pm 
      JOIN users u ON pm.user_id = u.id 
      WHERE pm.project_id = $1
    `;
    const allMembersResult = await query(allMembersQuery, [project.id]);
    
    console.log(`\n📋 All members of project ${project.id}:`);
    allMembersResult.rows.forEach((row: any) => {
      console.log(`  User ${row.user_id} (${row.name}): ${row.role}`);
    });
    
    // Test the exact query used in getProjectMemberDB
    console.log('\n🔍 Testing getProjectMemberDB logic...');
    const getMembersQuery = `
      SELECT pm.id, pm.project_id, pm.user_id, pm.role, pm.created_at,
             u.name, u.email
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
      ORDER BY pm.created_at ASC
    `;
    const getMembersResult = await query(getMembersQuery, [project.id]);
    
    const foundMember = getMembersResult.rows.find((m: any) => m.user_id === project.created_by);
    console.log(`📋 getProjectMemberDB result for creator:`, foundMember ? 'FOUND' : 'NOT FOUND');
    
    if (foundMember) {
      console.log(`📋 Found member role: "${foundMember.role}"`);
      console.log(`📋 Role check result: ${foundMember.role === 'submitter' ? 'PASS' : 'FAIL'}`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugProjectDeletion();
