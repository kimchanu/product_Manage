import { businessLocations, normalizeLocation } from '../../utils/businessLocation';
export const budgetSites = businessLocations;
export const budgetDepartments = ['ITS', '기전', '시설'];
export const budgetKey = (site, department) => `${site}:${department}`;
export const normalizeBudgetSite = normalizeLocation;
export function parseAmount(value) {
  const text = String(value).trim();
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(text)) return null;
  const amount = Number(text.replace(/,/g, ''));
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
}
export function budgetSnapshot(data, year) {
  if (!Array.isArray(data.budget)) throw new Error('예산 응답 형식이 올바르지 않습니다.');
  const snapshot = {};
  data.budget.forEach((item) => {
    const site = normalizeBudgetSite(item.site);
    const key = budgetKey(site, item.department);
    const amount = parseAmount(item.amount);
    if (!budgetSites.includes(site) || !budgetDepartments.includes(item.department) || Number(item.year ?? year) !== year || amount === null) throw new Error('예산 데이터의 사업소·연도·금액을 확인해 주세요.');
    if (Object.prototype.hasOwnProperty.call(snapshot, key)) throw new Error(`${site} ${item.department} 예산이 중복되어 있습니다.`);
    snapshot[key] = amount;
  });
  return snapshot;
}
export function budgetEdits(snapshot, draft, year) {
  const changes = [], errors = {};
  budgetSites.forEach((site) => budgetDepartments.forEach((department) => {
    const key = budgetKey(site, department);
    const original = snapshot[key] ?? null;
    const value = draft[key] ?? '';
    if (!String(value).trim() && original === null) return;
    const amount = parseAmount(value);
    if (amount === null) { errors[key] = '0 이상의 정수 금액을 입력해 주세요.'; return; }
    if (amount !== original) changes.push({ site, department, year, amount, expectedAmount: original });
  }));
  return { changes, errors, dirty: changes.length > 0 || Object.keys(errors).length > 0 };
}
