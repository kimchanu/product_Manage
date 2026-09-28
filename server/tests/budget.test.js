const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const { validateBudget, budgetYear } = require('../services/budgetValidation');
let rows, writes, events, failOnWrite;
const model = {
  findAll: async (options) => rows.filter(row => !options?.where || row.year === options.where.year),
  upsert: async (values) => {
    writes.push(values);
    if (failOnWrite === writes.length) throw new Error('test database failure');
    const index = rows.findIndex(row => row.year === values.year && row.business_location === values.business_location && row.department === values.department);
    if (index === -1) rows.push({ id: 50, ...values }); else rows[index] = { ...rows[index], ...values };
  },
};
require.cache[require.resolve('../db/sequelize')] = { exports: { define: () => model, transaction: async (fn) => {
  const original = structuredClone(rows); events.push('begin');
  try { await fn({ LOCK: { UPDATE: 'UPDATE' } }); events.push('commit'); }
  catch (error) { rows = original; events.push('rollback'); throw error; }
} } };
const app = express(); app.use(express.json()); app.use(require('../routes/budget'));
const auth = (admin) => jwt.sign({ user_id: 2, full_name: '테스트', admin }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_2024', { expiresIn: '10m' });
let server, base;
before(async () => { server = await new Promise(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); }); base = `http://127.0.0.1:${server.address().port}`; });
after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
beforeEach(() => { rows = [{ id: 1, year: 2026, business_location: 'GK사업소', department: 'ITS', budget_amount: 1000 }, { id: 2, year: 2025, business_location: 'GK사업소', department: 'ITS', budget_amount: 500 }]; writes = []; events = []; failOnWrite = 0; });
const entry = { site: 'GK사업소', department: 'ITS', amount: 2000, expectedAmount: 1000 };
const save = (budget, admin = 1, year = 2026) => fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(admin === null ? {} : { Authorization: `Bearer ${auth(admin)}` }) }, body: JSON.stringify({ year, budget }) });
test('validates the entire batch before database writes', async () => {
  for (const amount of [-1, 1.5, '', 'abc', null, true, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => validateBudget({ year: 2026, budget: [{ ...entry, amount }] }));
  assert.throws(() => budgetYear('2026.5'));
  assert.throws(() => budgetYear(0));
  assert.equal((await save([entry, { ...entry, department: '시설', year: 2025 }])).status, 400);
  assert.deepEqual(events, []); assert.deepEqual(writes, []);
});
test('duplicate aliases are rejected instead of inserting twice', () => {
  assert.throws(() => validateBudget({ year: 2026, budget: [entry, { ...entry, site: 'GK' }] }));
  assert.equal(validateBudget({ year: 2026, budget: [{ ...entry, site: '강남순환사업소' }] }).budget[0].site, '강남사업소');
});
test('only authenticated admins may save', async () => {
  assert.equal((await save([entry], null)).status, 401);
  assert.equal((await save([entry], 0)).status, 403);
  assert.equal((await save([entry], 'invalid')).status, 403);
  assert.deepEqual(events, []);
});
test('updates only the requested year and accepts zero budget', async () => {
  assert.equal((await save([{ ...entry, amount: 0 }])).status, 200);
  assert.equal(rows.find(row => row.year === 2026).budget_amount, 0);
  assert.equal(rows.find(row => row.year === 2025).budget_amount, 500);
  assert.deepEqual(events, ['begin', 'commit']);
});
test('stale existing and concurrently created entries cannot be overwritten', async () => {
  assert.equal((await save([{ ...entry, expectedAmount: 900 }])).status, 409);
  assert.equal((await save([{ ...entry, expectedAmount: null }])).status, 409);
  assert.deepEqual(writes, []);
});
test('database errors roll back every entry in the batch', async () => {
  failOnWrite = 2;
  assert.equal((await save([entry, { site: '천마사업소', department: 'ITS', amount: 1500, expectedAmount: null }])).status, 500);
  assert.equal(rows[0].budget_amount, 1000);
  assert.equal(rows.length, 2);
  assert.deepEqual(events, ['begin', 'rollback']);
});
test('read validates year and retains the existing response contract', async () => {
  assert.equal((await fetch(base + '?year=-1')).status, 400);
  const response = await fetch(base + '?year=2026');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { year: 2026, budget: [{ site: 'GK사업소', department: 'ITS', amount: 1000, year: 2026 }] });
});
