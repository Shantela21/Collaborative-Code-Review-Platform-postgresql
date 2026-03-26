// Role System Test and Documentation
const http = require('http');

// Test the new role system
async function testRoleSystem() {
  console.log('🎭 Testing New Role System (Submitter/Reviewer)');
  console.log('==========================================\n');

  try {
    // Step 1: Register a user
    console.log('1️⃣ Registering new user...');
    const registerData = JSON.stringify({
      name: 'Submitter User',
      email: 'submitter@example.com',
      password: 'password123'
    });

    const registerResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(registerData)
      }
    }, registerData);

    console.log('Register Status:', registerResponse.statusCode);
    console.log('Register Response:', registerResponse.body);

    if (registerResponse.statusCode !== 201) {
      console.log('❌ Registration failed');
      return;
    }

    // Step 2: Login to get token
    console.log('\n2️⃣ Logging in...');
    const loginData = JSON.stringify({
      email: 'submitter@example.com',
      password: 'password123'
    });

    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, loginData);

    console.log('Login Status:', loginResponse.statusCode);
    console.log('Login Response:', loginResponse.body);

    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed');
      return;
    }

    const loginResult = JSON.parse(loginResponse.body);
    const token = loginResult.token;

    // Step 3: Create a project (should work now)
    console.log('\n3️⃣ Creating project...');
    const projectData = JSON.stringify({
      title: 'Test Project with New Roles',
      description: 'Testing submitter/reviewer role system'
    });

    const projectResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(projectData)
      }
    }, projectData);

    console.log('Project Creation Status:', projectResponse.statusCode);
    console.log('Project Creation Response:', projectResponse.body);

    if (projectResponse.statusCode === 201) {
      console.log('✅ SUCCESS! Project creation works with new role system');
      
      const project = JSON.parse(projectResponse.body);
      console.log('\n📋 Project Details:');
      console.log('- Title:', project.title);
      console.log('- Creator Role:', project.members[0].role);
      console.log('- Expected: submitter');
      
      if (project.members[0].role === 'submitter') {
        console.log('✅ Role system working correctly!');
      } else {
        console.log('❌ Role system issue - expected submitter, got:', project.members[0].role);
      }
    } else {
      console.log('❌ Project creation still failing');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        body: body
      }));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Role System Documentation
console.log(`
📖 ROLE SYSTEM DOCUMENTATION:
============================

New Role Hierarchy:
├── submitter (Project Owner)
│   ├── Can create projects
│   ├── Can update/delete own projects
│   ├── Can add/remove members
│   └── Can submit code for review
└── reviewer (Code Reviewer)
    ├── Can review submitted code
    ├── Can add comments
    ├── Can approve/reject submissions
    └── Can view project details

Previous System:
├── admin (Full control)
└── member (Limited access)

Migration:
- "admin" → "submitter" (project creators)
- "member" → "reviewer" (code reviewers)
- New users default to "reviewer" role
- Project creators automatically get "submitter" role

Benefits:
✅ More descriptive role names
✅ Clearer permissions
✅ Better reflects code review workflow
✅ Easier to understand for users

`);

testRoleSystem();
