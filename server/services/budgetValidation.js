const sites = {
  GK: 'GK사업소', CM: '천마사업소', ES: '을숙도사업소', KN: '강남사업소', GN: '강남사업소', SW: '수원사업소',
  GK사업소: 'GK사업소', 천마사업소: '천마사업소', 을숙도사업소: '을숙도사업소',
  강남사업소: '강남사업소', 강남순환사업소: '강남사업소', 수원사업소: '수원사업소',
};
const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
const normalizeBudgetSite = (site) => typeof site === 'string' ? sites[site.trim()] || site.trim() : '';
const validInteger = (value) => (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) && Number.isSafeInteger(Number(value));
function budgetYear(value) {
  if (!validInteger(value) || Number(value) < 1900 || Number(value) > 2100) fail('연도는 1900~2100 사이의 정수여야 합니다.');
  return Number(value);
}
function validateBudget(body) {
  const year = budgetYear(body.year);
  if (!Array.isArray(body.budget) || !body.budget.length || body.budget.length > 100) fail('저장할 예산 항목을 확인해 주세요.');
  const keys = new Set();
  const budget = body.budget.map((item) => {
    if (!item || typeof item !== 'object') fail('예산 항목 형식이 잘못되었습니다.');
    const site = normalizeBudgetSite(item.site);
    if (!Object.values(sites).includes(site) || !['ITS', '시설', '기전'].includes(item.department)) fail('사업소와 부서를 확인해 주세요.');
    if (item.year !== undefined && budgetYear(item.year) !== year) fail('저장 연도와 항목의 연도가 다릅니다.');
    if (!validInteger(item.amount) || Number(item.amount) < 0) fail('예산액은 0 이상의 정수여야 합니다.');
    const key = `${site}:${item.department}`;
    if (keys.has(key)) fail('동일한 사업소·부서 예산이 중복되었습니다.');
    keys.add(key);
    const hasExpected = Object.prototype.hasOwnProperty.call(item, 'expectedAmount');
    if (hasExpected && item.expectedAmount !== null && (!validInteger(item.expectedAmount) || Number(item.expectedAmount) < 0)) fail('기존 예산액 형식이 잘못되었습니다.');
    return { site, department: item.department, amount: Number(item.amount), year,
      hasExpected, expectedAmount: item.expectedAmount == null ? null : Number(item.expectedAmount) };
  });
  return { year, budget };
}
module.exports = { normalizeBudgetSite, budgetYear, validateBudget, fail };
