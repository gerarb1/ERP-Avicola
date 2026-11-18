// Read-only service checks. An optional token must belong to an authorized test account.
import assert from 'node:assert/strict';
const web = new URL(process.env.ERP_WEB_URL || '');
const api = new URL(process.env.ERP_API_URL || '');
for (const url of [web, api]) {
  assert.ok(url.protocol === 'https:' || (url.protocol === 'http:' && url.hostname === '127.0.0.1'), 'Use HTTPS outside local tests');
  assert.ok(!url.username && !url.password && !url.search, 'Do not embed credentials in URLs');
}
async function get(url, headers = {}) {
  return fetch(url, { headers, redirect: 'error', signal: AbortSignal.timeout(15000) });
}
const page = await get(web);
assert.equal(page.status, 200, 'Web does not return HTTP 200');
assert.match(page.headers.get('content-type') || '', /text\/html/, 'Web is not HTML');
const health = await get(new URL('/health', api));
assert.equal(health.status, 200, 'API health failed');
assert.equal((await health.json()).status, 'ok', 'Unexpected health body');
const denied = await get(new URL('/api/galpones', api));
assert.equal(denied.status, 401, 'API must reject unauthenticated requests');
let database = 'not_checked';
if (process.env.ERP_SMOKE_TOKEN) {
  const result = await get(new URL('/api/galpones', api), { Authorization: `Bearer ${process.env.ERP_SMOKE_TOKEN}` });
  assert.equal(result.status, 200, 'Authenticated database read failed');
  const body = await result.json();
  assert.ok(Array.isArray(body.data), 'Unexpected galpones response');
  database = 'passed';
}
if (process.env.ERP_REQUIRE_DATABASE_CHECK === '1') {
  assert.equal(database, 'passed', 'A live database check is required; provide ERP_SMOKE_TOKEN');
}

console.log(JSON.stringify({ check: 'smoke', status: 'passed', database, timestamp: new Date().toISOString() }));
