import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

async function check(options = {}) {
  const server = createServer((req, res) => {
    if (req.url === '/') {
      res.setHeader('content-type', 'text/html');
      return res.end('<html>ERP</html>');
    }
    res.setHeader('content-type', 'application/json');
    if (req.url === '/health') return res.end('{"status":"ok"}');
    if (req.headers.authorization === 'Bearer test-session' && !options.rejectToken) {
      return res.end('{"data":[]}');
    }
    res.statusCode = options.allowAnonymous ? 200 : 401;
    res.end('{}');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}`;
    return await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ['scripts/smoke.mjs'], {
        env: { ...process.env, ERP_WEB_URL: url, ERP_API_URL: url,
          ERP_SMOKE_TOKEN: options.token || '', ERP_REQUIRE_DATABASE_CHECK: options.required ? '1' : '0' },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let output = '';
      child.stdout.on('data', chunk => output += chunk);
      child.stderr.resume();
      child.on('error', reject);
      child.on('exit', code => resolve({ code, output }));
    });
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}
test('smoke básico identifica que no verificó la base', async () => {
  const result = await check();
  assert.equal(result.code, 0);
  assert.equal(JSON.parse(result.output).database, 'not_checked');
});
test('la entrega falla si exige consulta a datos y falta sesión', async () => {
  const result = await check({ required: true });
  assert.notEqual(result.code, 0);
  assert.equal(result.output, '');
});
test('la entrega acepta una consulta autenticada válida', async () => {
  const result = await check({ required: true, token: 'test-session' });
  assert.equal(result.code, 0);
  assert.equal(JSON.parse(result.output).database, 'passed');
});
test('la entrega falla si la sesión es inválida o se permite acceso anónimo', async () => {
  for (const options of [{ token: 'expired', required: true }, { allowAnonymous: true }]) {
    const result = await check(options);
    assert.notEqual(result.code, 0);
    assert.equal(result.output, '');
  }
});
