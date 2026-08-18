const BASE = 'http://localhost:5000/api';

async function call(method: string, path: string, body?: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  let data: any = null;
  try { data = await res.json(); } catch { /* empty */ }
  return { status: res.status, data };
}

async function main() {
  const a = (await call('POST', '/auth/login', { email: 'demo@civinest.org', password: 'DemoPass123!' })).data.data;
  const b = (await call('POST', '/auth/login', { email: 'ananya@civinest.org', password: 'DemoPass123!' })).data.data;
  console.log('demo id:', a.user._id, '| ananya id:', b.user._id);

  // Demo's private report
  const mine = await call('GET', '/reports', undefined, a.token);
  if (!mine.data?.data?.reports) { console.log('GET /reports failed:', mine.status, JSON.stringify(mine.data)); return; }
  const myReport = mine.data.data.reports.find((r: any) => r.reportNumber === '#CV-8100');
  console.log('demo report:', myReport._id, myReport.reportNumber);

  // Ananya tries to read / patch / verify demo's report
  const read = await call('GET', `/reports/${myReport._id}`, undefined, b.token);
  const readResident = await call('GET', `/resident/reports/${myReport._id}`, undefined, b.token);
  const patch = await call('PATCH', `/reports/${myReport._id}`, { status: 'Resolved' }, b.token);
  const verify = await call('PATCH', `/resident/reports/${myReport._id}/verify`, { resolved: true }, b.token);

  console.log('ananya reads demo report (GET /reports/:id):', read.status, '→', read.data?.error || 'LEAK!');
  console.log('ananya reads demo report (GET /resident/reports/:id):', readResident.status, '→', readResident.data?.error || 'LEAK!');
  console.log('ananya patches demo report:', patch.status, '→', patch.data?.error || 'LEAK!');
  console.log('ananya verifies demo report:', verify.status, '→', verify.data?.error || 'LEAK!');

  // Demo can verify own report
  const verifyOwn = await call('PATCH', `/resident/reports/${myReport._id}/verify`, { resolved: true }, a.token);
  console.log('demo verifies own report:', verifyOwn.status, '→ status=', verifyOwn.data?.data?.report?.status);

  // Verify timeline got the event
  const after = await call('GET', `/reports/${myReport._id}`, undefined, a.token);
  const timeline = after.data.data.report.timeline;
  console.log('timeline tail:', JSON.stringify(timeline[timeline.length - 1]));
}

main().catch((e) => { console.error(e); process.exit(1); });
