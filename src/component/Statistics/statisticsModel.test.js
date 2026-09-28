import { normalizeTrend, monthlyTotals, total, changeLabel, comparisonRows, budgetPosition } from './statisticsModel';

const fixture = normalizeTrend([
  { month: '1', byDept: { ITS: { input: '100', output: 60 }, 시설: { input: 40, output: 80 }, '합 계': { input: 140, output: 140 } } },
  { month: 2, byDept: { ITS: { input: 200, output: 120 } } },
  { month: 12, byDept: { ITS: { input: 9999, output: 9999 } } },
]);
test('period and department totals exclude future months and do not count the aggregate twice', () => {
  const all = monthlyTotals(fixture, '전체', 2);
  expect(total(all, 'input')).toBe(340);
  expect(total(all, 'output')).toBe(260);
  expect(monthlyTotals(fixture, 'ITS', 2).map(({ input, output }) => [input, output])).toEqual([[100, 60], [200, 120]]);
  expect(fixture[2].byDept.ITS.input).toBe(0);
});
test('zero baselines have no misleading infinite growth percentage', () => {
  expect(changeLabel(50, 0)).toBe('비교 기준 실적 없음');
  expect(changeLabel(0, 0)).toBe('변동 없음');
  expect(changeLabel(125, 100)).toBe('+25.0%');
  expect(changeLabel(50, 100)).toBe('-50.0%');
});
test('cumulative comparison aligns the same months and accumulates each year independently', () => {
  const current = monthlyTotals(fixture, 'ITS', 2);
  const previous = [{ input: 50 }, { input: 75 }];
  expect(comparisonRows(current, previous, 'input', true)).toEqual([
    { label: '1월', current: 100, previous: 50 }, { label: '2월', current: 300, previous: 125 },
  ]);
  expect(comparisonRows(current, previous, 'input', false)[1].current).toBe(200);
});
test('malformed API response does not turn into a successful zero-total report', () => {
  expect(() => normalizeTrend({ error: 'failed' })).toThrow();
});

test('remaining budget subtracts selected period purchases, not outputs or future purchases', () => {
  const rows = monthlyTotals(fixture, 'ITS', 2);
  expect(budgetPosition('1000', total(rows, 'input'))).toEqual({ budget: 1000, remaining: 700, rate: 30 });
  expect(budgetPosition(1000, total(monthlyTotals(fixture, '전체', 2), 'input')).remaining).toBe(660);
});

test('zero budget is registered and overspending remains negative', () => {
  expect(budgetPosition(0, 100)).toEqual({ budget: 0, remaining: -100, rate: null });
  expect(budgetPosition(100, 150)).toEqual({ budget: 100, remaining: -50, rate: 150 });
  expect(budgetPosition(100, 100).remaining).toBe(0);
});

test.each([undefined, null, '', ' ', 'invalid', -1, Infinity])('missing or invalid budget %p has no fabricated balance', (amount) => {
  expect(budgetPosition(amount, 100)).toEqual({ budget: null, remaining: null, rate: null });
});
