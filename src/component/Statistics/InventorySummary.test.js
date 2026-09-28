import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import InventorySummary from './InventorySummary';
import useInventoryTrend from './useInventoryTrend';
import { departments, normalizeTrend } from './statisticsModel';

jest.mock('./useInventoryTrend');
jest.mock('react-router-dom', () => ({ Link: ({ to, children }) => <a href={to}>{children}</a> }), { virtual: true });
jest.mock('recharts', () => ({ PieChart: ({ children }) => <div>{children}</div>, Pie: () => null, Cell: () => null }));
let container;
let root;
let stats;
const site = () => container.querySelector('[aria-label="ITS 예산 현황"]');
const render = async (defaultSite = 'GK사업소') => { await act(async () => root.render(<InventorySummary defaultSite={defaultSite} />)); };
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  stats = { loading: false, budgetError: '', refresh: jest.fn(),
    current: normalizeTrend([{ month: 1, byDept: { ITS: { input: 40, output: 9999 }, 시설: { input: 60, output: 9000 }, 기전: { input: 80, output: 8000 } } }]), error: '',
    budget: departments.map(department => ({ department, amount: 100 })),
  };
  useInventoryTrend.mockImplementation(() => stats);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); jest.clearAllMocks(); delete global.IS_REACT_ACT_ENVIRONMENT; });

test('only the current site departments show their own budgets and purchase ratios', async () => {
  await render();
  expect(container.querySelectorAll('.stats-site-budget')).toHaveLength(3);
  expect(site().querySelector('[role="img"]').getAttribute('aria-label')).toBe('ITS 예산 사용 40.0%, 잔여 60.0%');
  expect(site().querySelector('.stats-site-title strong').textContent).toBe('100원');
  expect(site().querySelector('dd').textContent).toBe('40원');
  expect(site().querySelector('.stats-site-remaining dd').textContent).toBe('60원');
  expect(container.querySelector('[aria-label="시설 예산 현황"] [role="img"]').getAttribute('aria-label')).toContain('사용 60.0%');
  expect(container.textContent).not.toContain('천마사업소');
});
test('fetches only the logged in site and updates when the site prop changes', async () => {
  await render();
  expect(useInventoryTrend).toHaveBeenLastCalledWith('GK', expect.any(Number), false, true);
  await render('천마사업소');
  expect(useInventoryTrend).toHaveBeenLastCalledWith('CM', expect.any(Number), false, true);
  expect(container.querySelector('h2').textContent).toBe('천마사업소 파트별 예산 현황');
  expect(container.querySelector('a').getAttribute('href')).toBe('/dashboard?site=CM');
});
test('zero purchase leaves registered budget fully available', async () => {
  stats.current = normalizeTrend([]); await render();
  expect(site().querySelector('[role="img"]').getAttribute('aria-label')).toBe('ITS 예산 사용 0.0%, 잔여 100.0%');
});
test('partial missing budgets never turn into a fabricated complete budget', async () => {
  stats.budget = stats.budget.slice(1); await render();
  expect(site().textContent).toContain('ITS 예산 미등록');
  expect(site().querySelector('.stats-site-title strong').textContent).toBe('미등록');
  expect(container.querySelector('[aria-label="시설 예산 현황"] [role="img"]').getAttribute('aria-label')).toContain('사용 60.0%');
});
test('overspending is a full ring with actual use percentage and explicit excess amount', async () => {
  stats.budget = departments.map(department => ({ department, amount: 20 })); await render();
  expect(site().querySelector('[role="img"]').getAttribute('aria-label')).toBe('ITS 예산 사용 200.0%, 잔여 0.0%, 초과 100.0%');
  expect(site().querySelector('.stats-site-budget-values .is-over-budget').textContent).toContain('예산 초과100.0%20원');
});
test('registered zero budget is not shown as missing or divided by zero', async () => {
  stats.budget = departments.map(department => ({ department, amount: 0 })); await render();
  expect(site().textContent).toContain('예산 0원 · 비율 산정 불가');
  expect(site().querySelector('.stats-site-title strong').textContent).toBe('0원');
});
test('failed purchases do not appear as successful zero spending', async () => {
  stats.current = null; stats.error = '조회 실패'; await render();
  expect(site().querySelector('[role="alert"]').textContent).toBe('구매액 조회 실패');
  expect(site().querySelector('dd').textContent).toBe('조회 실패');
});
test('budget failure is distinct from unregistered budgets and allows refresh', async () => {
  stats.budgetError = '예산 조회 실패'; await render();
  expect(site().querySelector('.stats-site-title strong').textContent).toBe('조회 실패');
  await act(async () => container.querySelector('button').click()); expect(stats.refresh).toHaveBeenCalledTimes(1);
});
