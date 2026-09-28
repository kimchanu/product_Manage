export const locations = [
  ['GK', 'GK사업소'], ['CM', '천마사업소'], ['ES', '을숙도사업소'],
  ['KN', '강남사업소'], ['SW', '수원사업소'],
];
export const normalizeLocation = (value) => locations.find(([code, name]) => code === value || name === value)?.[0] || value;
// Reporting APIs still use the original site names except for GK.
export const reportLocation = (value) => value === 'GK' ? value : locations.find(([code]) => code === value)?.[1] || value;
export const periodLabel = (year, month) => `${year}년 ${String(month).padStart(2, '0')}월`;
export const documentTitle = (doc) => doc.title || `${periodLabel(doc.report_year, doc.report_month)} ${doc.department} 자재수불명세서`;
export const dateLabel = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).slice(0, 16);
};
export async function approvalApi(path, options = {}) {
  const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/statement/approval${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}`, ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `요청에 실패했습니다. (${response.status})`);
  return data;
}
