// Final test for the fixed role system
const http = require('http');

async function testProjectCreation() {
  console.log('🧪 Testing Fixed Role System');
  console.log('============================\n');

  try {
    // Step 1: Login with existing user
    console.log('1️⃣ Logging in with existing user...');
    const loginData = JSON.stringify({
      email: 'test@example.com',
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
      console.log('❌ Login failed - trying to register new user...');
      
      // Register new user if login fails
      const registerData = JSON.stringify({
        name: 'Test Submitter',
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

      // Login with new user
      const newLoginData = JSON.stringify({
        email: 'submitter@example.com',
        password: 'password123'
      });

      const newLoginResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(newLoginData)
        }
      }, newLoginData);

      if (newLoginResponse.statusCode !== 200) {
        console.log('❌ New user login failed');
        return;
      }

      var loginResult = JSON.parse(newLoginResponse.body);
    } else {
      var loginResult = JSON.parse(loginResponse.body);
    }

    const token = loginResult.token;
    console.log('✅ Got token:', token ? 'Yes' : 'No');

    // Step 2: Create project
    console.log('\n2️⃣ Creating project...');
    const projectData = JSON.stringify({
      title: 'Test Project - Fixed Roles',
      description: 'Testing the fixed submitter/reviewer role system'
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
      console.log('\n🎉 SUCCESS! Project creation works!');
      
      const project = JSON.parse(projectResponse.body);
      console.log('\n📋 Project Details:');
      console.log('- Title:', project.title);
      console.log('- Creator Role:', project.members[0].role);
      console.log('- Expected: submitter');
      
      if (project.members[0].role === 'submitter') {
        console.log('✅ Role system working correctly!');
        console.log('\n🎯 The "Not authorized as admin" error has been FIXED!');
      } else {
        console.log('❌ Role system issue - expected submitter, got:', project.members[0].role);
      }
    } else {
      console.log('❌ Project creation still failing');
      console.log('Error details:', projectResponse.body);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Server is not running. Start it with: npm run dev');
    }
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

console.log(`
🔧 WHAT WAS FIXED:
=================

❌ BEFORE: "Not authorized as admin" error
✅ AFTER: Users can create projects with "submitter" role

🔄 ROLE MIGRATION:
- "developer" → "reviewer" (2 users)
- "user" → "reviewer" (1 user)
- "admin" → "submitter" (0 users)
- New users default to "reviewer"

🎭 NEW ROLE SYSTEM:
- submitter: Can create/manage projects
- reviewer: Can review code and comment

🚀 TEST INSTRUCTIONS:
1. Make sure server is running: npm run dev
2. Run this test: node test-fixed-roles.js
3. Should see "SUCCESS! Project creation works!"

`);

testProjectCreation();
