import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testRegistration() {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('Response:', data);
    } else {
      console.log('❌ Registration failed');
      console.log('Error:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testRegistration();
