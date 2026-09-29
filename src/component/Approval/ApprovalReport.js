import React, { useEffect, useState } from 'react';
import { periodLabel } from './approvalApi';
import { normalizeLocation, reportLocation } from '../../utils/businessLocation';

const departmentCategories = {
  ITS: ['TCS', 'FTMS', '전산', '기타', '합 계'],
  시설: ['안전', '장비', '시설보수', '조경', '기타', '합 계'],
  기전: ['전기', '기계', '소방', '기타', '합 계'],
};
const amountLabel = (value) => Number(value || 0).toLocaleString('ko-KR');

export default function ApprovalReport({ businessLocation, department, year, month }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [budget, setBudget] = useState(null);
  const [budgetError, setBudgetError] = useState('');
  const [revision, setRevision] = useState(0);
  const validPeriod = Number.isInteger(Number(year)) && Number(year) >= 2000 && Number(year) <= 2100
    && Number.isInteger(Number(month)) && Number(month) >= 1 && Number(month) <= 12;
  const categories = departmentCategories[department];
  useEffect(() => {
    const controller = new AbortController();
    setResult(null); setError(''); setBudget(null); setBudgetError('');
    if (!validPeriod || !categories) return () => controller.abort();
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` };
    const budgetRequest = fetch(`${process.env.REACT_APP_API_URL || ''}/api/budget?year=${year}`, { signal: controller.signal, headers })
      .then(async (response) => {
        if (!response.ok) throw new Error('예산 데이터를 불러오지 못했습니다.');
        const data = await response.json();
        if (!Array.isArray(data.budget)) throw new Error('예산 데이터를 확인할 수 없습니다.');
        const entry = data.budget.find((item) => normalizeLocation(item.site) === normalizeLocation(businessLocation) && item.department === department);
        if (entry && (!Number.isFinite(Number(entry.amount)) || Number(entry.amount) < 0)) throw new Error('예산 금액을 확인할 수 없습니다.');
        return { amount: entry ? Number(entry.amount) : null };
      }).catch((err) => ({ error: err.message }));
    (async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/statement`, {
          method: 'POST', signal: controller.signal,
          headers,
          body: JSON.stringify({ businessLocation: reportLocation(businessLocation), department, year, month,
            categories,
          }),
        });
        if (!response.ok) throw new Error('보고서 데이터를 불러오지 못했습니다.');
        const data = await response.json();
        if (!controller.signal.aborted) setResult(data);
      } catch (err) { if (!controller.signal.aborted) setError(err.message); }
    })();
    budgetRequest.then((data) => {
      if (!controller.signal.aborted) { setBudget(data.amount ?? null); setBudgetError(data.error || ''); }
    });
    return () => controller.abort();
  }, [businessLocation, department, year, month, validPeriod, categories, revision]);
  if (!validPeriod || !categories) return <p className="ap-notice">보고 기간과 부서를 확인해 주세요.</p>;
  if (error) return <div role="alert" className="ap-error">{error}<button className="ap-button" onClick={() => setRevision((value) => value + 1)}>보고서 다시 조회</button></div>;
  if (!result) return <p role="status" className="ap-loading">보고서를 불러오는 중입니다.</p>;
  const hasRows = Object.keys(result.byCategory || {}).length > 0;
  const spent = Number(result.yearTotalInputAmount || 0);
  const siteName = normalizeLocation(businessLocation);
  return <section className="ap-report" aria-label="자재수불명세서 월간보고서">
    <header className="ap-report-heading"><h3>자재수불명세서 월간보고서</h3><p>{periodLabel(year, month)} · {siteName} · {department}</p></header>
    <div className="ap-section-heading"><h3>자재수불 내역</h3><span>단위: 원</span></div>
    <div className="ap-table-scroll"><table aria-label="월간 자재수불 내역"><thead><tr><th scope="col">분류</th><th scope="col">전월 재고</th><th scope="col">당월 입고</th><th scope="col">당월 출고</th><th scope="col">잔여 재고</th></tr></thead>
      <tbody>{hasRows ? categories.map((category) => <tr key={category} className={category === '합 계' ? 'ap-report-total' : ''}><th scope="row">{category}</th>{['prevStock', 'input', 'output', 'remaining'].map((key) => <td className="ap-number" key={key}>{amountLabel(result.byCategory?.[category]?.[key])}</td>)}</tr>) : <tr><td colSpan={5} className="ap-empty-cell">해당 기간의 보고서 데이터가 없습니다.</td></tr>}</tbody>
    </table></div>
    <div className="ap-section-heading"><h3>{year}년 예산집행 현황</h3><span>단위: 원</span></div>
    {budgetError ? <div role="alert" className="ap-error">{budgetError}<button className="ap-button" onClick={() => setRevision((value) => value + 1)}>보고서 다시 조회</button></div> : <div className="ap-table-scroll"><table aria-label="월간 예산집행 현황"><thead><tr>{['구분', '예산', '당월집행 금액', '집행누계 금액', '잔액', '집행률'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody><tr><th scope="row">{month}월</th><td className="ap-number">{budget === null ? '-' : amountLabel(budget)}</td><td className="ap-number">{amountLabel(result.byCategory?.['합 계']?.input)}</td><td className="ap-number">{amountLabel(spent)}</td><td className="ap-number">{budget === null ? '-' : amountLabel(budget - spent)}</td><td className="ap-number">{budget > 0 ? `${(spent / budget * 100).toFixed(1)}%` : '-'}</td></tr></tbody></table></div>}
  </section>;
}
