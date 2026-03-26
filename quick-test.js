// Quick test to check if server is using updated code
const http = require('http');

async function quickTest() {
  try {
    // Test a simple endpoint to see if server is running
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    }, null);

    if (response.statusCode === 200) {
      console.log('✅ Server is running');
      
      // Test project creation with a simple request
      const projectData = JSON.stringify({
        title: 'Quick Test',
        description: 'Testing'
      });

      const projectResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/projects',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token-for-testing'
        }
      }, projectData);

      console.log('Project Response Status:', projectResponse.statusCode);
      console.log('Project Response Body:', projectResponse.body);

      if (projectResponse.statusCode === 401) {
        console.log('✅ Auth middleware is working (expected 401 for fake token)');
      } else if (projectResponse.statusCode === 403 && projectResponse.body.includes('Not authorized as admin')) {
        console.log('❌ Admin middleware is being triggered - this is the problem!');
        console.log('The admin middleware should NOT be called for project creation');
      } else {
        console.log('🤔 Unexpected response:', projectResponse.statusCode);
      }
    } else {
      console.log('❌ Server not responding');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Start the server with: npm run dev');
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

quickTest();
