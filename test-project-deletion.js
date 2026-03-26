// Test project deletion with debugging
const http = require('http');

async function testProjectDeletion() {
  console.log('🧪 Testing Project Deletion with Debug Info');
  console.log('==========================================\n');

  try {
    // Step 1: Login to get token and user info
    console.log('1️⃣ Logging in...');
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
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed - trying register...');
      
      // Register new user
      const registerData = JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
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
      
      if (registerResponse.statusCode !== 201) {
        console.log('❌ Registration failed too');
        return;
      }

      // Try login again
      const newLoginResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      }, loginData);

      if (newLoginResponse.statusCode !== 200) {
        console.log('❌ Login after registration failed');
        return;
      }
      
      var loginResult = JSON.parse(newLoginResponse.body);
    } else {
      var loginResult = JSON.parse(loginResponse.body);
    }

    const token = loginResult.token;
    console.log('✅ Token obtained');
    console.log('User info from login:', {
      id: loginResult.user?.id,
      email: loginResult.user?.email,
      name: loginResult.user?.name,
      role: loginResult.user?.role
    });

    // Step 2: Create a project
    console.log('\n2️⃣ Creating test project...');
    const projectData = JSON.stringify({
      title: 'Test Project for Deletion',
      description: 'Testing project deletion'
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

    if (projectResponse.statusCode !== 201) {
      console.log('❌ Project creation failed');
      return;
    }

    const createdProject = JSON.parse(projectResponse.body);
    const projectId = createdProject.id;
    console.log(`✅ Created project with ID: ${projectId}`);

    // Step 3: Try to delete the project
    console.log('\n3️⃣ Attempting to delete project...');
    const deleteResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/projects/${projectId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, null);

    console.log('Delete Status:', deleteResponse.statusCode);
    console.log('Delete Response:', deleteResponse.body);

    if (deleteResponse.statusCode === 204) {
      console.log('✅ Project deletion successful!');
    } else if (deleteResponse.statusCode === 403) {
      console.log('❌ "Not authorized to delete this project" - This is the error we need to fix');
      console.log('\n🔍 Possible causes:');
      console.log('1. User ID in token does not match project creator');
      console.log('2. User is not in project_members with "submitter" role');
      console.log('3. Project ID mismatch');
    } else {
      console.log('⚠️ Unexpected response:', deleteResponse.statusCode);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
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
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

testProjectDeletion();
