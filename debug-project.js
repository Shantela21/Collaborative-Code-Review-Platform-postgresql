// Debug script to trace the exact error
const http = require('http');

async function debugProjectCreation() {
  console.log('🔍 Debugging Project Creation Error');
  console.log('===================================\n');

  try {
    // Step 1: Login first
    console.log('1️⃣ Attempting login...');
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
      console.log('❌ Login failed - trying register...');
      
      // Try registering a new user
      const registerData = JSON.stringify({
        name: 'Debug User',
        email: 'debug@example.com',
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
        console.log('❌ Registration failed too');
        return;
      }

      // Login with new user
      const newLoginData = JSON.stringify({
        email: 'debug@example.com',
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
    console.log('✅ Token obtained:', token ? 'Yes' : 'No');

    // Step 2: Check user info first
    console.log('\n2️⃣ Checking user info...');
    const userResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, null);

    console.log('User Info Status:', userResponse.statusCode);
    console.log('User Info Response:', userResponse.body);

    // Step 3: Try project creation with detailed error
    console.log('\n3️⃣ Attempting project creation...');
    const projectData = JSON.stringify({
      title: 'Debug Project',
      description: 'Testing project creation'
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

    if (projectResponse.statusCode === 403) {
      console.log('\n🚨 403 Forbidden - This suggests an authorization issue');
      console.log('Possible causes:');
      console.log('1. User role is not "submitter"');
      console.log('2. Admin middleware is being applied somewhere');
      console.log('3. Database role is not updated');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    
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
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

console.log(`
🔍 DEBUGGING STEPS:
==================

1. Check if server is running
2. Try to login/register user
3. Check user's current role
4. Attempt project creation
5. Analyze the exact error

If you still get "Not authorized as admin":
- The admin middleware is being called from somewhere
- Check server logs for more details
- The user role might not be updated in the session

`);

debugProjectCreation();
