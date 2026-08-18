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
  console.log('\n🧪 CiviNest Municipal Officer Tests\n');

  const munToken = await login('municipal@civinest.org', 'MunicipalPass123!');
  const citizenToken = await login('demo@civinest.org', 'DemoPass123!');
  const repToken = await login('siddhant@gmail.com', 'DemoPass123!');

  // TEST 1 — Role gating
  await test('Citizen cannot access municipal dashboard (403)', async () => {
    const { status } = await api('GET', '/municipal/dashboard', undefined, citizenToken);
    assert(status === 403, `Expected 403, got ${status}`);
  });

  await test('Community Representative cannot access municipal API (403)', async () => {
    const { status } = await api('GET', '/municipal/issues', undefined, repToken);
    assert(status === 403, `Expected 403, got ${status}`);
  });

  await test('No token returns 401', async () => {
    const { status } = await api('GET', '/municipal/dashboard');
    assert(status === 401, `Expected 401, got ${status}`);
  });

  // TEST 2 — Dashboard metrics come from the database
  await test('Municipal dashboard returns real metrics', async () => {
    const { status, data } = await api('GET', '/municipal/dashboard', undefined, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
    const d = data.data.dashboard;
    assert(typeof d.totalIssues === 'number' && d.totalIssues > 0, `totalIssues should be > 0, got ${d.totalIssues}`);
    assert(d.criticalIssues >= 0 && d.activeIssues >= 0, 'Metrics should be non-negative');
    assert(Array.isArray(d.departments) && d.departments.length > 0, 'Departments should not be empty');
    assert(Array.isArray(d.priorityQueue), 'priorityQueue should be an array');
  });

  // TEST 3 — Issues list with filters
  await test('Municipal issues list returns real issues', async () => {
    const { status, data } = await api('GET', '/municipal/issues?limit=10', undefined, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.total > 0, 'Issue total should be > 0');
    assert(data.data.issues.length > 0, 'Issues should not be empty');
    const first = data.data.issues[0];
    assert(first.reportNumber && first.title, 'Issue should have reportNumber and title');
    assert(typeof first.priorityScore === 'number', 'Issue should have numeric priorityScore');
  });

  await test('Issue status filter works', async () => {
    const { data } = await api('GET', '/municipal/issues?status=Reopened&limit=50', undefined, munToken);
    assert(data.data.issues.every((i: any) => i.status === 'Reopened'), 'All issues should be Reopened');
  });

  await test('Issue assignment filter works', async () => {
    const { data } = await api('GET', '/municipal/issues?assignment=unassigned&limit=50', undefined, munToken);
    assert(data.data.issues.every((i: any) => !i.assignedAt), 'Unassigned issues should have no assignedAt');
  });

  // TEST 4 — Issue detail
  await test('Issue detail loads', async () => {
    const { data } = await api('GET', '/municipal/issues?limit=1', undefined, munToken);
    const id = data.data.issues[0].id;
    const { status, data: detailData } = await api('GET', `/municipal/issues/${id}`, undefined, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(detailData.data.issue.description, 'Issue detail should include description');
    assert(Array.isArray(detailData.data.issue.timeline), 'Issue detail should include timeline');
  });

  // TEST 5 — Departments + teams
  await test('Departments list returns real departments', async () => {
    const { status, data } = await api('GET', '/municipal/departments', undefined, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.departments.length > 0, 'Departments should not be empty');
    assert(data.data.departments[0].name && data.data.departments[0].code, 'Department should have name + code');
  });

  await test('Teams list returns real teams', async () => {
    const { status, data } = await api('GET', '/municipal/teams', undefined, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.teams.length > 0, 'Teams should not be empty');
  });

  // TEST 6 — Assignment workflow with validation
  await test('Assign rejects invalid team/department mismatch', async () => {
    const { data } = await api('GET', '/municipal/issues?assignment=unassigned&limit=1', undefined, munToken);
    const issueId = data.data.issues[0].id;
    const { data: deptData } = await api('GET', '/municipal/departments', undefined, munToken);
    const { data: teamData } = await api('GET', '/municipal/teams', undefined, munToken);
    const waterDept = deptData.data.departments.find((d: any) => d.name === 'Water Supply');
    const roadsTeam = teamData.data.teams.find((t: any) => t.department === 'Roads & Transport');
    const { status, data: res } = await api('PUT', `/municipal/issues/${issueId}/assign`, { departmentId: waterDept.id, teamId: roadsTeam.id }, munToken);
    assert(status === 400, `Expected 400 for mismatched team, got ${status} (${res.error})`);
  });

  await test('Assign validates missing issue (404)', async () => {
    const { status } = await api('PUT', '/municipal/issues/000000000000000000000000/assign', { reason: 'test' }, munToken);
    assert(status === 404, `Expected 404, got ${status}`);
  });

  await test('Assign an issue with department + team + priority override', async () => {
    const { data } = await api('GET', '/municipal/issues?assignment=unassigned&limit=5', undefined, munToken);
    const issue = data.data.issues[0];
    const { data: deptData } = await api('GET', '/municipal/departments', undefined, munToken);
    const { data: teamData } = await api('GET', '/municipal/teams', undefined, munToken);
    const dept = deptData.data.departments.find((d: any) => d.name === 'Drainage');
    const team = teamData.data.teams.find((t: any) => t.department === 'Drainage');
    const { status, data: res } = await api('PUT', `/municipal/issues/${issue.id}/assign`, {
      departmentId: dept.id,
      teamId: team.id,
      priorityOverride: 'high',
      reason: 'Triage priority verified',
      notes: 'Crew dispatched',
    }, munToken);
    assert(status === 200, `Expected 200, got ${status} (${res.error})`);
    assert(res.data.assigned === true, 'Assignment should succeed');

    // Verify persistence
    const { data: detail } = await api('GET', `/municipal/issues/${issue.id}`, undefined, munToken);
    assert(detail.data.issue.municipal?.department === 'Drainage', 'Department should be persisted');
    assert(detail.data.issue.municipal?.team === team.name, 'Team should be persisted');
    assert(detail.data.issue.municipal?.priorityOverrides?.length >= 1, 'Priority override should be audited');
  });

  // TEST 7 — Workflow: start work → complete → resolution → reopen
  await test('Workflow start → resolution → reopen', async () => {
    const { data } = await api('GET', '/municipal/issues?assignment=unassigned&limit=5', undefined, munToken);
    const issue = data.data.issues[0];
    const { data: deptData } = await api('GET', '/municipal/departments', undefined, munToken);
    const dept = deptData.data.departments.find((d: any) => d.name === 'Street Lighting');
    await api('PUT', `/municipal/issues/${issue.id}/assign`, { departmentId: dept.id, reason: 'workflow test' }, munToken);

    // Start work
    const start = await api('POST', `/municipal/issues/${issue.id}/work-start`, { notes: 'Team on site' }, munToken);
    assert(start.status === 200, `work-start failed: ${start.data.error}`);
    assert(start.data.data.status === 'In Progress', `Expected In Progress, got ${start.data.data.status}`);

    // Resolution (missing description → 400)
    const bad = await api('POST', `/municipal/issues/${issue.id}/resolution`, {}, munToken);
    assert(bad.status === 400, `Expected 400 for empty resolution, got ${bad.status}`);

    // Valid resolution
    const res = await api('POST', `/municipal/issues/${issue.id}/resolution`, { description: 'Fixed the issue on site.' }, munToken);
    assert(res.status === 200, `resolution failed: ${res.data.error}`);
    assert(res.data.data.status === 'Verification', `Expected Verification, got ${res.data.data.status}`);

    // Resolution state
    const state = await api('GET', `/municipal/issues/${issue.id}/resolution`, undefined, munToken);
    assert(state.data.data.verificationState === 'AWAITING_VERIFICATION', `Expected AWAITING_VERIFICATION, got ${state.data.data.verificationState}`);
    assert(state.data.data.resolution.description === 'Fixed the issue on site.', 'Resolution description should persist');

    // Reopen
    const reopen = await api('POST', `/municipal/issues/${issue.id}/reopen`, { reason: 'Resident reports the issue persists' }, munToken);
    assert(reopen.status === 200, `reopen failed: ${reopen.data.error}`);
    assert(reopen.data.data.status === 'Reopened', `Expected Reopened, got ${reopen.data.data.status}`);
  });

  await test('Invalid status transition rejected', async () => {
    const { data } = await api('GET', '/municipal/issues?status=Under%20Review&limit=1', undefined, munToken);
    const issue = data.data.issues[0];
    // Under Review → reopen is not allowed
    const { status } = await api('POST', `/municipal/issues/${issue.id}/reopen`, { reason: 'x' }, munToken);
    assert(status === 409, `Expected 409, got ${status}`);
  });

  // TEST 8 — Spatial data
  await test('Spatial returns real coordinates', async () => {
    const { status, data } = await api('GET', '/municipal/spatial', undefined, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.issues.length > 0, 'Spatial issues should not be empty');
    assert(data.data.clusters.length > 0, 'Spatial clusters should not be empty');
    assert(data.data.wards.length > 0, 'Wards should not be empty');
    const hasCoords = data.data.issues.every((i: any) => typeof i.latitude === 'number' && typeof i.longitude === 'number');
    assert(hasCoords, 'All issues should have real coordinates');
  });

  await test('Spatial filter narrows results', async () => {
    const { data } = await api('GET', '/municipal/spatial?category=lighting', undefined, munToken);
    assert(data.data.issues.length > 0, 'Filtered spatial data should not be empty');
    assert(data.data.issues.every((i: any) => i.category.includes('lighting') || i.category.includes('Lighting')), 'All filtered issues should be lighting');
  });

  // TEST 9 — Analytics
  await test('Analytics reflects database data', async () => {
    const { status, data } = await api('GET', '/municipal/analytics', undefined, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
    const a = data.data.analytics;
    assert(a.summary.totalIssues > 0, 'totalIssues should be > 0');
    assert(Array.isArray(a.categories) && a.categories.length > 0, 'Categories should exist');
    assert(Array.isArray(a.issueVolumeTrend), 'Trend should exist');
    assert(typeof a.sla.compliance === 'number', 'SLA compliance should be numeric');
  });

  // TEST 10 — AI brief is grounded
  await test('AI brief is grounded in real data', async () => {
    const { status, data } = await api('GET', '/municipal/ai/briefs', undefined, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.brief.grounded === true, 'Brief should be grounded');
    assert(data.data.brief.summary.length > 0, 'Brief should have a summary');
  });

  // TEST 11 — Notifications
  await test('Notifications are tied to the officer and markable read', async () => {
    const { status, data } = await api('GET', '/municipal/notifications', undefined, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.total >= 1, 'Should have at least one notification');
    const first = data.data.notifications[0];
    const read = await api('PATCH', `/municipal/notifications/${first.id}/read`, undefined, munToken);
    assert(read.status === 200, `mark read failed: ${read.status}`);
    const after = await api('GET', '/municipal/notifications', undefined, munToken);
    const updated = after.data.data.notifications.find((n: any) => n.id === first.id);
    assert(updated && updated.read === true, 'Notification should be marked read');
  });

  await test('Mark all notifications read', async () => {
    const { status } = await api('PATCH', '/municipal/notifications/read-all', undefined, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
  });

  // TEST 12 — Audit log
  await test('Audit log records municipal actions', async () => {
    const { status, data } = await api('GET', '/municipal/audit', undefined, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.log.length > 0, 'Audit log should not be empty');
    const actions = data.data.log.map((e: any) => e.action);
    assert(
      actions.some((a: string) => ['ISSUE_ASSIGNED', 'RESOLUTION_SUBMITTED', 'WORK_STARTED', 'PRIORITY_OVERRIDDEN'].includes(a)),
      'Audit log should contain workflow actions'
    );
  });

  // TEST 13 — Profile
  await test('Profile returns authenticated officer identity', async () => {
    const { status, data } = await api('GET', '/municipal/profile', undefined, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.user.name, 'Profile should include name');
    assert(data.data.user.role === 'MUNICIPAL_OFFICER', 'Profile should have municipal role');
  });

  await test('Profile update cannot change role', async () => {
    const { status, data } = await api('PATCH', '/municipal/profile', { role: 'ADMIN', name: 'Hacker', phone: '+91 90000 00000' }, munToken);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.data.user.role === 'MUNICIPAL_OFFICER', 'Role must stay MUNICIPAL_OFFICER');
    assert(data.data.user.name !== 'Hacker', 'Name must not be client-settable');
  });

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  console.log(`\n📊 Municipal tests: ${passed}/${results.length} passed${failed ? `, ${failed} failed` : ''}\n`);
  if (failed > 0) process.exitCode = 1;
}

runTests().catch((e) => {
  console.error('Test runner failed:', e);
  process.exit(1);
});
