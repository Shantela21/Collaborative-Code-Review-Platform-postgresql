const http = require('http');

// Test registration
function testRegistration() {
  const data = JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('📝 Registration Response:');
      console.log('Status:', res.statusCode);
      console.log('Body:', body);
      
      if (res.statusCode === 201) {
        console.log('✅ Registration successful!');
        testLogin();
      } else {
        console.log('❌ Registration failed');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Registration error:', e.message);
  });

  req.write(data);
  req.end();
}

// Test login
function testLogin() {
  const data = JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('\n🔐 Login Response:');
      console.log('Status:', res.statusCode);
      console.log('Body:', body);
      
      if (res.statusCode === 200) {
        const response = JSON.parse(body);
        console.log('✅ Login successful!');
        console.log('Token:', response.token ? 'Received' : 'Missing');
        testProjectCreation(response.token);
      } else {
        console.log('❌ Login failed');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Login error:', e.message);
  });

  req.write(data);
  req.end();
}

// Test project creation
function testProjectCreation(token) {
  const data = JSON.stringify({
    title: 'Test Project',
    description: 'A test project for testing'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/projects',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('\n📁 Project Creation Response:');
      console.log('Status:', res.statusCode);
      console.log('Body:', body);
      
      if (res.statusCode === 201) {
        console.log('✅ Project creation successful!');
      } else {
        console.log('❌ Project creation failed');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Project creation error:', e.message);
  });

  req.write(data);
  req.end();
}

console.log('🚀 Starting API tests...');
console.log('Make sure the server is running on http://localhost:3000\n');

testRegistration();
