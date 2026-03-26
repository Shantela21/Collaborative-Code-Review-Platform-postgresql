// Simple test to check server and API functionality
const http = require('http');

function makeRequest(options, data, description) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body,
          description: description
        });
      });
    });

    req.on('error', (e) => {
      reject({
        error: e.message,
        description: description
      });
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🚀 Testing API endpoints...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    try {
      const healthCheck = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET'
      }, null, 'Server Health');
      
      if (healthCheck.statusCode === 200) {
        console.log('✅ Server is running');
      } else {
        console.log('❌ Server responded with:', healthCheck.statusCode);
        return;
      }
    } catch (error) {
      console.log('❌ Server not accessible:', error.error);
      console.log('💡 Make sure the server is running with: npm run dev');
      return;
    }

    // Test 2: Register user
    console.log('\n2️⃣ Testing user registration...');
    const registerData = JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    try {
      const register = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(registerData)
        }
      }, registerData, 'User Registration');

      console.log('Status:', register.statusCode);
      console.log('Response:', register.body);

      if (register.statusCode !== 201) {
        console.log('❌ Registration failed');
        return;
      }

      // Test 3: Login
      console.log('\n3️⃣ Testing user login...');
      const loginData = JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      });

      const login = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      }, loginData, 'User Login');

      console.log('Status:', login.statusCode);
      console.log('Response:', login.body);

      if (login.statusCode !== 200) {
        console.log('❌ Login failed');
        return;
      }

      const loginResponse = JSON.parse(login.body);
      const token = loginResponse.token;

      if (!token) {
        console.log('❌ No token received from login');
        return;
      }

      // Test 4: Create project
      console.log('\n4️⃣ Testing project creation...');
      const projectData = JSON.stringify({
        title: 'Test Project',
        description: 'A test project for debugging'
      });

      const project = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/projects',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Length': Buffer.byteLength(projectData)
        }
      }, projectData, 'Project Creation');

      console.log('Status:', project.statusCode);
      console.log('Response:', project.body);

      if (project.statusCode === 201) {
        console.log('✅ Project creation successful!');
      } else {
        console.log('❌ Project creation failed');
        console.log('🔍 This is the error we need to fix');
      }

    } catch (error) {
      console.log('❌ API request failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

console.log('🔧 API Diagnostic Tool');
console.log('======================\n');
testAPI();
