import { normalizeLocation, approvalRequest } from '../../utils/businessLocation';
export const periodLabel = (year, month) => `${year}년 ${String(month).padStart(2, '0')}월`;
export const documentTitle = (doc) => doc.title || `${periodLabel(doc.report_year, doc.report_month)} ${doc.department} 자재수불명세서`;
export const dateLabel = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).slice(0, 16);
};
export async function approvalApi(path, options = {}) {
  const request = approvalRequest(path, options);
  const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/statement/approval${request.path}`, {
    ...request.options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}`, ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `요청에 실패했습니다. (${response.status})`);
  if (Array.isArray(data.drafts)) data.drafts = data.drafts.map((draft) => ({ ...draft, businessLocation: normalizeLocation(draft.businessLocation) }));
  return data;
}
