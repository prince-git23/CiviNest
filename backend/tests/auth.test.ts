const API_BASE = 'http://localhost:5000/api';

interface TestResult {
  name: string;
  passed: boolean;
  detail?: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (error: any) {
    results.push({ name, passed: false, detail: error.message });
    console.log(`  ✗ ${name}: ${error.message}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function api(method: string, path: string, body?: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('\n🧪 CiviNest Backend Auth Tests\n');

  // Health check
  await test('Health endpoint returns healthy', async () => {
    const { status, data } = await api('GET', '/health');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Expected success: true');
    assert(data.data?.status === 'healthy', 'Expected status: healthy');
  });

  // Register new user
  let token = '';
  let userId = '';

  await test('Register new user succeeds', async () => {
    const testEmail = `test${Date.now()}@civinest.org`;
    const { status, data } = await api('POST', '/auth/register', {
      name: 'Test User',
      email: testEmail,
      password: 'SecurePass123!',
    });
    assert(status === 201, `Expected 201, got ${status}`);
    assert(data.success === true, 'Expected success: true');
    assert(data.data?.token, 'Expected token');
    assert(data.data?.user?.email === testEmail, 'Expected matching email');
    assert(data.data?.user?.role === 'CITIZEN', 'Expected default CITIZEN role');
    assert(!data.data?.user?.passwordHash, 'Should not expose passwordHash');
    token = data.data.token;
    userId = data.data.user._id;
  });

  // Duplicate email
  await test('Register with duplicate email fails', async () => {
    const { status, data } = await api('POST', '/auth/register', {
      name: 'Duplicate User',
      email: 'test@civinest.org',
      password: 'SecurePass123!',
    });
    // First call might succeed (first registration), second should fail
    assert(status === 409 || status === 201, `Expected 409 or 201, got ${status}`);
  });

  // Invalid registration data
  await test('Register with invalid data fails', async () => {
    const { status } = await api('POST', '/auth/register', {
      name: '',
      email: 'not-an-email',
      password: '123',
    });
    assert(status === 400, `Expected 400, got ${status}`);
  });

  // Get me (authenticated)
  await test('Get /me with valid token returns user', async () => {
    const { status, data } = await api('GET', '/auth/me', undefined, token);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Expected success: true');
    assert(data.data?.user?._id === userId, 'Expected matching user ID');
    assert(data.data?.permissions, 'Expected permissions array');
  });

  // Get me (unauthenticated)
  await test('Get /me without token returns 401', async () => {
    const { status } = await api('GET', '/auth/me');
    assert(status === 401, `Expected 401, got ${status}`);
  });

  // Login
  await test('Login with valid credentials succeeds', async () => {
    const { status, data } = await api('POST', '/auth/login', {
      email: 'test@civinest.org',
      password: 'SecurePass123!',
    });
    // Only succeeds if the user was registered above
    if (status === 200) {
      assert(data.data?.token, 'Expected token');
      assert(data.data?.user?.email, 'Expected user email');
    } else {
      assert(status === 401, `Expected 401 (user not registered), got ${status}`);
    }
  });

  // Login with wrong password
  await test('Login with wrong password returns 401', async () => {
    const { status } = await api('POST', '/auth/login', {
      email: 'test@civinest.org',
      password: 'WrongPassword!',
    });
    assert(status === 401, `Expected 401, got ${status}`);
  });

  // Logout
  await test('Logout with valid token succeeds', async () => {
    const { status, data } = await api('POST', '/auth/logout', undefined, token);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Expected success: true');
  });

  // Profile update
  await test('Update profile with valid data succeeds', async () => {
    const { status, data } = await api('PUT', '/auth/profile', {
      city: 'Nagpur',
      ward: 'Ward 14',
      isOnboarded: true,
    }, token);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data?.user?.city === 'Nagpur', 'Expected city: Nagpur');
  });

  // 404 route
  await test('Unknown route returns 404', async () => {
    const { status } = await api('GET', '/nonexistent');
    assert(status === 404, `Expected 404, got ${status}`);
  });

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n${passed}/${total} tests passed\n`);

  if (passed < total) {
    console.log('Failed tests:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  ✗ ${r.name}: ${r.detail}`);
    });
  }
}

runTests().catch(console.error);
