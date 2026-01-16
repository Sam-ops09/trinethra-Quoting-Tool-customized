
import 'dotenv/config';

const API_URL = 'http://localhost:5000/api';
let cookie = '';

async function request(endpoint: string, method: string = 'GET', body?: any) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cookie) headers['Cookie'] = cookie;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  
  // Capture cookies if login
  if (endpoint === '/auth/login' && response.headers.get('set-cookie')) {
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) cookie = setCookie.split(';')[0];
  }
  
  return { status: response.status, data };
}

async function run() {
    console.log('🧪 VERIFYING DEFAULT ROLE FIX');
    
    // 1. Login as Admin
    const loginRes = await request('/auth/login', 'POST', { email: 'admin@example.com', password: 'Admin@123' });
    if (loginRes.status !== 200) {
        console.error('Login failed');
        process.exit(1);
    }

    // 2. Create user WITHOUT role
    const email = `default_role_test_${Date.now()}@test.com`;
    console.log(`Creating user ${email} without specifying role...`);
    
    const createRes = await request('/users', 'POST', {
        email,
        password: 'Test@12345',
        name: 'Default Role Tester',
        // role is OMITTED
    });

    if (createRes.status !== 200) {
        console.error('Failed to create user:', createRes.data);
        process.exit(1);
    }

    const user = createRes.data;
    console.log('User created:', user);

    if (user.role === 'viewer') {
        console.log('✅ PASS: Default role is "viewer"');
    } else {
        console.error(`❌ FAIL: Default role is "${user.role}" (expected "viewer")`);
        process.exit(1);
    }
}

run();
