const BASE = 'http://localhost:5000/api';

async function call(method: string, path: string, body?: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data: any = null;
  try { data = await res.json(); } catch { /* empty */ }
  return { status: res.status, data };
}

async function main() {
  const login = await call('POST', '/auth/login', { email: 'demo@civinest.org', password: 'DemoPass123!' });
  console.log('login:', login.status, login.data?.data?.user?.email, login.data?.data?.user?.role);
  if (login.status !== 200) { console.log(JSON.stringify(login.data)); return; }
  const token = login.data.data.token;

  const checks: [string, string][] = [
    ['dashboard', '/resident/dashboard'],
    ['ward/metrics', '/resident/ward/metrics'],
    ['insights', '/resident/insights'],
    ['trends', '/resident/trends'],
    ['map/clusters', '/resident/map/clusters'],
    ['map/issues', '/resident/map/issues'],
    ['map/wards', '/resident/map/wards'],
    ['map/localities', '/resident/map/localities'],
    ['map/nearby', '/resident/map/nearby?lat=21.1462&lng=79.0874&radius=500'],
    ['impact', '/resident/impact'],
    ['discussions', '/resident/discussions'],
    ['reports (own)', '/resident/reports/'],
  ];

  for (const [name, path] of checks) {
    const r = await call('GET', path, undefined, token);
    let summary = '';
    if (r.data?.data) {
      const d = r.data.data;
      if (d.dashboard) summary = `insight=${JSON.stringify(d.dashboard.aiInsight?.location)} reports=${d.dashboard.recentReports?.length} clusters=${d.dashboard.nearbyClusters?.length}`;
      else if (d.metrics) summary = `overall=${d.metrics.overallScore} source=${d.metrics.source} metrics=${d.metrics.metrics?.length} sensors=${d.metrics.sensors?.length}`;
      else if (d.insights) summary = `insight[0]=${JSON.stringify(d.insights[0]?.location)}`;
      else if (d.trends) summary = `trends=${d.trends.length} first=${d.trends[0]?.title} residents=${d.trends[0]?.independentResidents}`;
      else if (d.clusters) summary = `clusters=${d.clusters.length}`;
      else if (d.issues) summary = `issues=${d.issues.length} first=${JSON.stringify(d.issues[0])?.slice(0, 160)}`;
      else if (d.wards) summary = `wards=${d.wards.length}`;
      else if (d.localities) summary = `localities=${d.localities.length}`;
      else if (d.impact) summary = `points=${d.impact.points}`;
      else if (d.discussions) summary = `discussions=${d.discussions.length}`;
      else if (d.reports) summary = `reports=${d.reports.length}`;
    }
    console.log(`${r.status} ${name}: ${summary || JSON.stringify(r.data?.error || r.data)?.slice(0, 140)}`);
  }

  // Trend detail
  const trends = await call('GET', '/resident/trends', undefined, token);
  const t0 = trends.data?.data?.trends?.[0];
  if (t0) {
    const td = await call('GET', `/resident/trends/${t0.id}`, undefined, token);
    console.log('trend/:id:', td.status, 'reports=', td.data?.data?.trend?.recentReports?.length, 'related=', td.data?.data?.trend?.relatedTrends?.length, 'firstReported=', td.data?.data?.trend?.firstReported);
  }

  // Cluster detail
  const clusters = await call('GET', '/resident/map/clusters', undefined, token);
  const c0 = clusters.data?.data?.clusters?.[0];
  if (c0) {
    const cd = await call('GET', `/resident/map/clusters/${c0.id}`, undefined, token);
    console.log('map/clusters/:id:', cd.status, 'title=', cd.data?.data?.cluster?.title?.slice(0, 60), 'signals=', cd.data?.data?.cluster?.recentSignals?.length);
  }

  // Security: resident B cannot read/verify resident A's report
  const loginB = await call('POST', '/auth/login', { email: 'ananya@civinest.org', password: 'DemoPass123!' });
  const tokenB = loginB.data.data.token;
  const myReports = await call('GET', '/api/reports', undefined, token);
  const otherReportId = myReports.data?.data?.reports?.find((r: any) => r.userId !== login.data.data.user._id)?._id;
  if (otherReportId) {
    const readOther = await call('GET', `/resident/reports/${otherReportId}`, undefined, tokenB);
    const verifyOther = await call('PATCH', `/resident/reports/${otherReportId}/verify`, { resolved: true }, tokenB);
    const readViaReports = await call('GET', `/reports/${otherReportId}`, undefined, tokenB);
    console.log('SECURITY: ananya reads demo report:', readOther.status, '| verify:', verifyOther.status, '| via /reports:', readViaReports.status);
  } else {
    console.log('SECURITY: no other-user report found to test with');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
