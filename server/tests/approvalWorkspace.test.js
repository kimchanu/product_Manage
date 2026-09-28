const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');

let calls = [];
let transactionEvents = [];
let scenario = '';
const db = {
  query: async (sql, args) => {
    calls.push({ sql, args });
    if (sql.startsWith('CREATE TABLE')) return [{}];
    if (sql.includes('SELECT id FROM users')) return [[{ id: 9 }]];
    if (sql.startsWith('SELECT id FROM statement_approval_drafts')) return [scenario === 'foreign' ? [] : [{ id: 3 }]];
    if (sql.startsWith('SELECT id FROM statement_approval_documents')) return [scenario === 'duplicate' ? [{ id: 4 }] : []];
    if (sql.startsWith('INSERT INTO statement_approval_documents')) return [{ insertId: 15 }];
    if (sql.startsWith('INSERT INTO statement_approval_details') && scenario === 'failure') throw new Error('injected failure');
    if (sql.startsWith('UPDATE statement_approval_drafts') || sql.startsWith('DELETE FROM statement_approval_drafts') || sql.startsWith('UPDATE statement_approval_circulation')) return [{ affectedRows: scenario === 'foreign' ? 0 : 1 }];
    if (sql.startsWith('SELECT d.*')) return [[]];
    return [{ insertId: 3, affectedRows: 1 }];
  },
  getConnection: async () => ({ query: (...args) => db.query(...args),
    beginTransaction: async () => transactionEvents.push('begin'), commit: async () => transactionEvents.push('commit'),
    rollback: async () => transactionEvents.push('rollback'), release: () => transactionEvents.push('release'),
  }),
};
require.cache[require.resolve('../db')] = { exports: db };
const approvalService = require('../services/statementApprovalService');
approvalService.ensureApprovalTables = async () => {};
approvalService.getApprovalSetting = async () => scenario === 'no-approver' ? null : ({ approver_user_id: 7, approver_name: '승인자' });
const { validateDraft } = require('../services/approvalWorkspaceService');
const router = require('../routes/approvalWorkspace');
const user = { user_id: 2, full_name: '작성자', business_location: 'GK사업소', department: 'ITS', admin: 0 };
const payload = { businessLocation: 'GK', department: 'ITS', year: 2026, month: 9, title: '월간보고서', content: '내용', recipients: [9] };
let server;
let base;
before(async () => {
  const app = express(); app.use(express.json()); app.use((req, res, next) => { req.user = user; next(); }); app.use(router);
  server = await new Promise((resolve) => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }));
beforeEach(() => { calls = []; transactionEvents = []; scenario = ''; });
const request = (path, body, method = 'POST') => new Promise((resolve, reject) => {
  const req = http.request(`${base}${path}`, { method, agent: false, headers: { 'Content-Type': 'application/json' } }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => resolve({ status: res.statusCode, json: async () => JSON.parse(data) }));
  });
  req.on('error', reject);
  req.end(body ? JSON.stringify(body) : undefined);
});

test('rejects invalid periods and cross-site/department drafts', () => {
  assert.throws(() => validateDraft({ ...payload, month: 13 }, user), { status: 400 });
  assert.throws(() => validateDraft({ ...payload, businessLocation: 'CM' }, user), { status: 403 });
  assert.throws(() => validateDraft({ ...payload, department: '시설' }, user), { status: 403 });
  assert.deepEqual(validateDraft({ ...payload, recipients: [9, 9] }, user).recipients, [9]);
});
test('draft editing and deletion are restricted to their owner', async () => {
  scenario = 'foreign';
  assert.equal((await request('/drafts', { ...payload, id: 3 })).status, 404);
  assert.equal((await request('/drafts/3', null, 'DELETE')).status, 404);
  assert.ok(calls.filter((call) => /UPDATE statement_approval_drafts|DELETE FROM statement_approval_drafts/.test(call.sql)).every((call) => call.sql.includes('AND user_id = ?') && call.args.at(-1) === 2));
});
test('submission persists the report, content and recipients in one transaction', async () => {
  const response = await request('/submit', { ...payload, id: 3 });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).id, 15);
  assert.deepEqual(transactionEvents, ['begin', 'commit', 'release']);
  assert.ok(calls.some((call) => call.sql.startsWith('INSERT INTO statement_approval_circulation')));
  assert.ok(calls.some((call) => call.sql.startsWith('DELETE FROM statement_approval_drafts')));
});
test('duplicate periods and foreign drafts cannot be submitted', async () => {
  scenario = 'duplicate';
  assert.equal((await request('/submit', payload)).status, 409);
  assert.ok(!calls.some((call) => call.sql.startsWith('INSERT INTO statement_approval_documents')));
  scenario = 'foreign';
  assert.equal((await request('/submit', { ...payload, id: 3 })).status, 404);
});
test('a failed submission rolls back and retains the draft', async () => {
  scenario = 'failure';
  assert.equal((await request('/submit', { ...payload, id: 3 })).status, 500);
  assert.deepEqual(transactionEvents, ['begin', 'rollback', 'release']);
  assert.ok(!calls.some((call) => call.sql.startsWith('DELETE FROM statement_approval_drafts')));
});
test('submission requires an assigned approver', async () => {
  scenario = 'no-approver';
  assert.equal((await request('/submit', payload)).status, 400);
  assert.equal(transactionEvents.length, 0);
});
test('circulation reads are restricted to the recipient after approval', async () => {
  scenario = 'foreign';
  assert.equal((await request('/documents/15/read')).status, 404);
  const update = calls.find((call) => call.sql.startsWith('UPDATE statement_approval_circulation'));
  assert.ok(update.sql.includes("d.status = 'approved'"));
  assert.deepEqual(update.args, ['15', 2]);
});
test('document listing enforces site and circulation visibility', async () => {
  assert.equal((await request('/documents?businessLocation=CM', null, 'GET')).status, 403);
  assert.equal((await request('/documents?businessLocation=GK', null, 'GET')).status, 200);
  const listing = calls.find((call) => call.sql.startsWith('SELECT d.*'));
  assert.ok(listing.sql.includes("c.user_id = ? AND d.status = 'approved'"));
  assert.equal(listing.args[3], 0);
});
