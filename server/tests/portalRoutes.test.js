const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
let calls = [];
let affectedRows = 1;
const db = { query: async (sql, args) => {
  calls.push({ sql, args });
  if (sql.startsWith('UPDATE users')) return [{ affectedRows }];
  return [[]];
} };
require.cache[require.resolve('../db')] = { exports: db };
require.cache[require.resolve('../db2')] = { exports: {
  QueryTypes: { INSERT: 'INSERT', SELECT: 'SELECT' },
  query: async (sql, options) => { calls.push({ sql, args: options.replacements }); return [15]; },
} };
const app = express(); app.use(express.json());
app.use('/user', require('../routes/user'));
app.use('/admin', require('../routes/admin'));
app.use('/posts', require('../routes/postRoutes'));
const token = jwt.sign({ user_id: 12, full_name: '테스트 작성자', admin: 0 }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_2024', { expiresIn: '1m' });
let server, base;
before(async () => { server = await new Promise(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); }); base = `http://127.0.0.1:${server.address().port}`; });
after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
beforeEach(() => { calls = []; affectedRows = 1; });
const request = (path, body, auth = true) => fetch(base + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });

test('password change uses verified identity, not a supplied account', async () => {
  const response = await request('/user/change-password', { username: 'another-user', currentPassword: 'before', newPassword: 'after' });
  assert.equal(response.status, 200);
  assert.deepEqual(calls[0].args, ['after', 12, 'before']);
});
test('password validation rejects missing, short and incorrect passwords', async () => {
  assert.equal((await request('/user/change-password', { currentPassword: 'old', newPassword: 'a' })).status, 400);
  assert.equal(calls.length, 0);
  affectedRows = 0;
  assert.equal((await request('/user/change-password', { currentPassword: 'bad', newPassword: 'after' })).status, 401);
});
test('account routes require authentication and activity is user scoped', async () => {
  assert.equal((await request('/user/activity', null, false)).status, 401);
  assert.equal(calls.length, 0);
  assert.equal((await request('/user/activity')).status, 200);
  assert.deepEqual(calls[0].args, [12, '테스트 작성자', '테스트 작성자']);
  assert.match(calls[0].sql, /author_id = \?/);
  assert.match(calls[0].sql, /SELECT COUNT\(\*\) FROM users WHERE full_name = \?\) = 1/);
});
test('ordinary members can read scheduled popups but cannot manage them', async () => {
  assert.equal((await request('/admin/popups/active')).status, 200);
  const query = calls.find(call => call.sql.includes('WHERE is_active'));
  assert.match(query.sql, /start_date <= NOW\(\)/);
  assert.match(query.sql, /end_date >= NOW\(\)/);
  assert.equal((await request('/admin/popups')).status, 403);
});
test('post creation records authenticated author and restricts notice flags', async () => {
  assert.equal((await request('/posts', { title: '제목', content: '내용', author: '위조', author_id: 999, is_notice: true, is_top: true })).status, 201);
  assert.deepEqual(calls[0].args, ['제목', '내용', '테스트 작성자', 12, 'general', 0, 0, 0]);
});
test('unauthenticated posts are rejected before accessing the database', async () => {
  assert.equal((await request('/posts', { title: '제목', content: '내용' }, false)).status, 401);
  assert.equal(calls.length, 0);
});

test('invalid popup dates and empty edits are rejected for administrators', async () => {
  const adminToken = jwt.sign({ user_id: 12, full_name: '테스트 관리자', admin: 1 }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_2024', { expiresIn: '1m' });
  for (const body of [{ title: '', content: '내용' }, { title: '제목', content: '내용', start_date: '2026-09-12T12:00', end_date: '2026-09-11T12:00' }]) {
    const response = await fetch(base + '/admin/popups/1', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` }, body: JSON.stringify(body) });
    assert.equal(response.status, 400);
  }
  assert.equal(calls.length, 0);
});
