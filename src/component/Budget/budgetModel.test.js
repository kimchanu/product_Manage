import { parseAmount, budgetSnapshot, budgetEdits } from './budgetModel';
test('amounts accept zero and grouped integers, reject invalid or lossy values', () => {
  expect(parseAmount('0')).toBe(0);
  expect(parseAmount('12,345,678')).toBe(12345678);
  ['', '-1', '1.2', '1e5', '1,23', 'NaN', '9007199254740992'].forEach((value) => expect(parseAmount(value)).toBeNull());
});
test('only changed cells are sent with the selected year and original amount', () => {
  const snapshot = { 'GK사업소:ITS': 1000, 'GK사업소:기전': 2000 };
  const result = budgetEdits(snapshot, { 'GK사업소:ITS': '1,000', 'GK사업소:기전': '0', '수원사업소:시설': '500' }, 2027);
  expect(result.changes).toEqual([
    { site: 'GK사업소', department: '기전', year: 2027, amount: 0, expectedAmount: 2000 },
    { site: '수원사업소', department: '시설', year: 2027, amount: 500, expectedAmount: null },
  ]);
  expect(result.errors).toEqual({});
});
test('clearing a registered amount is an error, not a silent deletion', () => {
  const result = budgetEdits({ 'GK사업소:ITS': 0 }, { 'GK사업소:ITS': '' }, 2026);
  expect(result.dirty).toBe(true);
  expect(result.errors['GK사업소:ITS']).toBeTruthy();
});
test('reads normalize site aliases and reject cross-year or duplicate data', () => {
  expect(budgetSnapshot({ budget: [{ site: '강남순환사업소', department: 'ITS', amount: '1000', year: 2026 }] }, 2026)).toEqual({ '강남사업소:ITS': 1000 });
  expect(() => budgetSnapshot({ budget: [{ site: 'GK', department: 'ITS', amount: 1, year: 2025 }] }, 2026)).toThrow();
  expect(() => budgetSnapshot({ budget: [{ site: 'GK', department: 'ITS', amount: 1 }, { site: 'GK사업소', department: 'ITS', amount: 1 }] }, 2026)).toThrow();
});
