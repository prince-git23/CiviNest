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

async function login(email: string, password: string): Promise<string> {
  const { status, data } = await api('POST', '/auth/login', { email, password });
  if (status !== 200 || !data.data?.token) throw new Error(`Login failed for ${email}: ${data.error || status}`);
  return data.data.token;
}

async function runTests() {
  console.log('\n🧪 CiviNest Community Representative Tests\n');

  const repToken = await login('siddhant@gmail.com', 'DemoPass123!');
  const citizenToken = await login('demo@civinest.org', 'DemoPass123!');

  // TEST 1 — Citizen cannot access Community APIs (403)
  await test('Citizen cannot access community dashboard (403)', async () => {
    const { status } = await api('GET', '/community/dashboard', undefined, citizenToken);
    assert(status === 403, `Expected 403, got ${status}`);
  });

  await test('Citizen cannot create aggregations (403)', async () => {
    const { status } = await api('POST', '/community/aggregations', { issueIds: [], context: 'x' }, citizenToken);
    assert(status === 403, `Expected 403, got ${status}`);
  });

  // TEST 2 — Representative can access their dashboard (200)
  await test('Representative can access dashboard (200)', async () => {
    const { status, data } = await api('GET', '/community/dashboard', undefined, repToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Expected success');
    assert(data.data?.dashboard, 'Expected dashboard data');
  });

  // TEST 4 — Dashboard metrics come from the database, not mock values
  await test('Dashboard metrics are real database values', async () => {
    const { data } = await api('GET', '/community/dashboard', undefined, repToken);
    const d = data.data.dashboard;
    assert(typeof d.health.score === 'number', 'Health score should be a number');
    assert(d.health.breakdown && d.health.breakdown.length > 0, 'Health should include an explainable breakdown');
    assert(typeof d.metrics.activeIssues.count === 'number', 'Active issues should be a number');
    assert(d.community.location.includes('Ward 14'), 'Community context should come from the rep profile (Ward 14)');
    assert(d.community.name === 'Green Valley Residency', 'Community name from rep profile');
  });

  // TEST 5 — Issues endpoint returns actual reports
  await test('Issues endpoint returns real reports', async () => {
    const { status, data } = await api('GET', '/community/issues?limit=20', undefined, repToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.pagination.total > 0, 'Expected at least one issue in scope');
    const issue = data.data.issues[0];
    assert(issue.reportNumber, 'Issue should have a report number');
    assert(issue.title, 'Issue should have a title');
    assert(issue.status, 'Issue should have a status');
  });

  // Issue detail
  await test('Issue detail returns timeline + related issues', async () => {
    const { data } = await api('GET', '/community/issues?limit=1', undefined, repToken);
    const id = data.data.issues[0].id;
    const { status, data: detail } = await api('GET', `/community/issues/${id}`, undefined, repToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(detail.data.issue.timeline, 'Issue should include a timeline');
    assert(Array.isArray(detail.data.issue.relatedIssues), 'Issue should include related issues');
  });

  // TEST 6 — Map returns actual coordinates
  await test('Map returns real coordinates for issues and clusters', async () => {
    const { status, data } = await api('GET', '/community/map/issues', undefined, repToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.issues.length > 0, 'Expected map issues');
    for (const i of data.data.issues) {
      assert(typeof i.latitude === 'number' && i.latitude !== 0, 'Issue latitude should be a real number');
      assert(typeof i.longitude === 'number' && i.longitude !== 0, 'Issue longitude should be a real number');
    }
    const clustersRes = await api('GET', '/community/map/clusters', undefined, repToken);
    assert(clustersRes.data.data.clusters.length > 0, 'Expected map clusters');
  });

  // TEST 7 — Map filters by geographic scope
  await test('Map data is scoped to the representative ward', async () => {
    const { data } = await api('GET', '/community/map/issues', undefined, repToken);
    for (const i of data.data.issues) {
      assert(i.ward === 'Ward 14' || i.ward === '', `Issue outside scope: ward="${i.ward}"`);
    }
  });

  // TEST 8/9 — Aggregation creates a real record + idempotent duplicate
  let aggIssueIds: string[] = [];
  let aggContext = '';

  await test('Aggregation creates a real record', async () => {
    const { data } = await api('GET', '/community/issues?limit=5', undefined, repToken);
    aggIssueIds = [data.data.issues[1].id, data.data.issues[2].id];
    aggContext = `Test aggregation ${Date.now()} — related reports grouped for municipal review.`;
    const { status, data: aggRes } = await api('POST', '/community/aggregations', {
      issueIds: aggIssueIds,
      context: aggContext,
    }, repToken);
    // First run creates (201); re-runs on the same DB are idempotent (409).
    assert(status === 201 || status === 409, `Expected 201 or 409, got ${status}`);
    if (status === 201) {
      assert(aggRes.data.aggregation.issueIds.length === 2, 'Aggregation should link both issues');
      assert(aggRes.data.aggregation.representativeId, 'Aggregation should record the representative');
    } else {
      assert(aggRes.data.duplicate === true, 'Expected duplicate flag on re-run');
    }
  });

  await test('Duplicate aggregation is idempotent (409)', async () => {
    const { status, data } = await api('POST', '/community/aggregations', {
      issueIds: aggIssueIds,
      context: aggContext,
    }, repToken);
    assert(status === 409, `Expected 409, got ${status}`);
    assert(data.data.duplicate === true, 'Expected duplicate flag');
  });

  // TEST 10 — Representative cannot change AI priority
  await test('Representative cannot set priority/severity/status (400)', async () => {
    const { status, data } = await api('POST', '/community/aggregations', {
      issueIds: aggIssueIds,
      context: 'should be rejected',
      priority: 'critical',
      severity: 'critical',
      status: 'Resolved',
    }, repToken);
    assert(status === 400, `Expected 400, got ${status}`);
    assert(data.error.includes('authoritative metrics'), 'Expected anti-manipulation message');
  });

  // Aggregation list
  await test('Aggregation list returns the created record', async () => {
    const { status, data } = await api('GET', '/community/aggregations?limit=10', undefined, repToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.aggregations.length > 0, 'Expected aggregations');
  });

  // TEST 13 — Members endpoint does not expose private auth data
  await test('Members endpoint never exposes password/auth data', async () => {
    const { status, data } = await api('GET', '/community/members?limit=10', undefined, repToken);
    assert(status === 200, `Expected 200, got ${status}`);
    const raw = JSON.stringify(data);
    assert(!raw.includes('passwordHash'), 'passwordHash leaked');
    assert(!raw.includes('password'), 'password field leaked');
    assert(data.data.members.length > 0, 'Expected members');
    for (const m of data.data.members) {
      assert(m.name, 'Member should have a name');
      assert(m.verificationStatus, 'Member should have a verification status');
    }
  });

  // TEST 12 — Analytics returns real aggregation data
  await test('Analytics computed from real database data', async () => {
    const { status, data } = await api('GET', '/community/analytics?range=30D', undefined, repToken);
    assert(status === 200, `Expected 200, got ${status}`);
    const a = data.data.analytics;
    assert(a.totals.totalIssues > 0, 'Expected total issues from DB');
    assert(Array.isArray(a.categories) && a.categories.length > 0, 'Expected category distribution');
    assert(Array.isArray(a.trend7d) && a.trend7d.length > 0, 'Expected 7-day trend');
    assert(typeof a.resolution.resolutionRate === 'number', 'Expected resolution rate');
  });

  // TEST 15 — Profile update cannot change role/community/ward
  await test('Profile update cannot change role or ward (400)', async () => {
    const { status, data } = await api('PATCH', '/community/profile', {
      role: 'ADMIN',
      ward: 'Ward 99',
      community: 'Other Society',
    }, repToken);
    assert(status === 400, `Expected 400, got ${status}`);
    assert(data.error.includes('protected'), 'Expected protected-field message');
  });

  await test('Profile update allows safe fields (name/phone)', async () => {
    const { status } = await api('PATCH', '/community/profile', { phone: '+91 99999 00000' }, repToken);
    assert(status === 200, `Expected 200, got ${status}`);
  });

  // TEST 14 — Notifications are tied to the authenticated representative
  await test('Notifications are scoped to the representative', async () => {
    const { status, data } = await api('GET', '/community/notifications', undefined, repToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(Array.isArray(data.data.notifications), 'Expected notifications array');
    assert(typeof data.data.unread === 'number', 'Expected unread count');
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
    process.exitCode = 1;
  }
}

runTests().catch((e) => {
  console.error('Test runner failed:', e.message);
  process.exitCode = 1;
});
