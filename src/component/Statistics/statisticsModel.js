export const departments = ['ITS', '시설', '기전'];
export const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
export const won = (value) => `${Math.round(number(value)).toLocaleString('ko-KR')}원`;
export const axisAmount = (value) => `${Number((number(value) / 10000).toFixed(1)).toLocaleString('ko-KR')}`;

export function normalizeTrend(data) {
  if (!Array.isArray(data)) throw new Error('월별 통계 응답 형식이 올바르지 않습니다.');
  return Array.from({ length: 12 }, (_, index) => {
    const row = data.find((item) => Number(item?.month) === index + 1);
    return { month: index + 1, label: `${index + 1}월`, byDept: Object.fromEntries(departments.map((dept) => [dept, {
      input: number(row?.byDept?.[dept]?.input), output: number(row?.byDept?.[dept]?.output),
    }])) };
  });
}
export function monthlyTotals(rows, department = '전체', endMonth = 12) {
  return rows.slice(0, endMonth).map((row) => {
    const selected = department === '전체' ? departments : [department];
    const input = selected.reduce((sum, dept) => sum + row.byDept[dept].input, 0);
    const output = selected.reduce((sum, dept) => sum + row.byDept[dept].output, 0);
    return { month: row.month, label: row.label, input, output };
  });
}
export const total = (rows, key) => rows.reduce((sum, row) => sum + number(row[key]), 0);
export function budgetPosition(amount, input) {
  const valid = (typeof amount === 'number' || (typeof amount === 'string' && amount.trim() !== ''))
    && Number.isFinite(Number(amount)) && Number(amount) >= 0;
  const budget = valid ? Number(amount) : null;
  return { budget, remaining: budget === null ? null : budget - input, rate: budget > 0 ? input / budget * 100 : null };
}
export function changeLabel(value, previous) {
  if (previous === 0) return value === 0 ? '변동 없음' : '비교 기준 실적 없음';
  const change = (value - previous) / Math.abs(previous) * 100;
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
}
export function comparisonRows(current, previous, key, cumulative) {
  let currentSum = 0;
  let previousSum = 0;
  return current.map((row, index) => {
    currentSum += row[key]; previousSum += previous[index]?.[key] || 0;
    return { label: row.label, current: cumulative ? currentSum : row[key], previous: cumulative ? previousSum : previous[index]?.[key] || 0 };
  });
}
