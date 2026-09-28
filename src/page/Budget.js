import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiRefreshCw, FiSave, FiRotateCcw, FiDollarSign, FiCheck } from 'react-icons/fi';
import WorkspaceLayout from '../layout/WorkspaceLayout';
import { budgetSites, budgetDepartments, budgetKey, parseAmount, budgetSnapshot, budgetEdits } from '../component/Budget/budgetModel';
import './Budget.css';

const format = (amount) => Number(amount).toLocaleString('ko-KR');
const toDraft = (snapshot) => Object.fromEntries(Object.entries(snapshot).map(([key, amount]) => [key, format(amount)]));

export default function Budget() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [snapshot, setSnapshot] = useState({});
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadedYear, setLoadedYear] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const savingRef = useRef(false);
  const edits = useMemo(() => budgetEdits(snapshot, draft, year), [snapshot, draft, year]);
  const ready = !loading && loadedYear === year;
  const invalid = Object.keys(edits.errors).length > 0;
  const changeKeys = new Set(edits.changes.map((item) => budgetKey(item.site, item.department)));
  const confirmDiscard = useCallback(() => !edits.dirty || window.confirm('저장하지 않은 변경사항을 취소하시겠습니까?'), [edits.dirty]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setLoadedYear(null); setError(''); setMessage('');
    setSnapshot({}); setDraft({});
    const load = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/budget?year=${year}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || '예산 조회에 실패했습니다.');
        const next = budgetSnapshot(data, year);
        if (!controller.signal.aborted) { setSnapshot(next); setDraft(toDraft(next)); setLoadedYear(year); }
      } catch (err) { if (!controller.signal.aborted) setError(err.message || '예산을 불러오지 못했습니다.'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    };
    load();
    return () => controller.abort();
  }, [year, revision]);

  useEffect(() => {
    if (!edits.dirty && !saving) return undefined;
    const beforeUnload = (event) => { event.preventDefault(); event.returnValue = ''; };
    const navigate = (event) => {
      const anchor = event.target.closest?.('a[href]');
      if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || anchor.target === '_blank') return;
      const url = new URL(anchor.href, window.location.href);
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (savingRef.current || !confirmDiscard()) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener('beforeunload', beforeUnload); document.addEventListener('click', navigate, true);
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', navigate, true); };
  }, [edits.dirty, saving, confirmDiscard]);

  const save = async () => {
    if (savingRef.current || !ready || invalid || !edits.changes.length) return;
    savingRef.current = true; setSaving(true); setError(''); setMessage('');
    const changes = edits.changes;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/budget`, { method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ year, budget: changes }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || '예산 저장에 실패했습니다.');
      const next = { ...snapshot };
      changes.forEach((item) => { next[budgetKey(item.site, item.department)] = item.amount; });
      setSnapshot(next); setDraft(toDraft(next)); setMessage(`${year}년 예산 ${changes.length}건을 저장했습니다.`);
    } catch (err) { setError(err.message || '예산을 저장하지 못했습니다.'); }
    finally { savingRef.current = false; setSaving(false); }
  };
  const totals = budgetSites.map((site) => ({ site, amount: budgetDepartments.reduce((sum, dept) => sum + (parseAmount(draft[budgetKey(site, dept)] ?? '') ?? 0), 0) }));
  const grandTotal = totals.reduce((sum, item) => sum + item.amount, 0);
  const registered = Object.keys(snapshot).length;

  return <WorkspaceLayout title="예산 관리" className="ws-budget-page">
    <div className="budget-toolbar"><div className="budget-heading"><FiDollarSign /><div><h2>잡자재 연간예산</h2><span>{year}년 · 사업소별 배정 현황</span></div></div>
      <div className="budget-actions"><label>예산 연도<select aria-label="예산 연도" value={year} disabled={saving} onChange={(event) => { if (confirmDiscard()) setYear(Number(event.target.value)); }}>
        {Array.from({ length: 201 }, (_, index) => 2100 - index).map((value) => <option key={value} value={value}>{value}년</option>)}
      </select></label><button className="ws-icon" title="새로고침" aria-label="예산 새로고침" disabled={loading || saving} onClick={() => { if (confirmDiscard()) setRevision((value) => value + 1); }}><FiRefreshCw /></button></div>
    </div>
    {error && <div className="ws-error" role="alert">{error}{!ready && !loading && <button className="ws-button" onClick={() => setRevision((value) => value + 1)}>다시 조회</button>}</div>}
    {message && <p className="budget-success" role="status"><FiCheck />{message}</p>}
    {loading ? <p className="budget-loading" role="status">{year}년 예산을 불러오는 중...</p> : ready && <>
      <div className="budget-summary"><section><h3>전체 예산{edits.dirty ? ' (편집 중)' : ''}</h3><strong>{invalid ? '-' : `${format(grandTotal)}원`}</strong></section><section><h3>등록 현황</h3><strong>{registered}<small> / {budgetSites.length * budgetDepartments.length}개 부서</small></strong></section><section><h3>저장할 변경</h3><strong>{edits.changes.length}<small>건{invalid ? ' · 입력 오류 있음' : ''}</small></strong></section></div>
      <div className="budget-table-heading"><h3>사업소 · 부서별 예산</h3><span>단위: 원</span></div>
      <div className="ws-scroll budget-table-wrap"><table className="budget-table"><thead><tr><th scope="col">사업소</th>{budgetDepartments.map((dept) => <th key={dept} scope="col">{dept}</th>)}<th scope="col">사업소 합계</th></tr></thead><tbody>
        {budgetSites.map((site) => <tr key={site}><th scope="row">{site}</th>{budgetDepartments.map((dept) => {
          const key = budgetKey(site, dept); const changed = changeKeys.has(key); const cellError = edits.errors[key]; const original = snapshot[key];
          return <td key={dept} className={cellError ? 'budget-cell-invalid' : changed ? 'budget-cell-changed' : ''}><label className="budget-amount"><input type="text" inputMode="numeric" aria-label={`${site} ${dept} 예산액`} aria-invalid={Boolean(cellError)} aria-describedby={cellError ? `budget-error-${budgetSites.indexOf(site)}-${dept}` : undefined} value={draft[key] ?? ''} placeholder="미등록" disabled={saving} onChange={(event) => { setDraft((prev) => ({ ...prev, [key]: event.target.value })); setMessage(''); }} onBlur={() => { const amount = parseAmount(draft[key] ?? ''); if (amount !== null) setDraft((prev) => ({ ...prev, [key]: format(amount) })); }} /></label><span className="budget-cell-note" id={`budget-error-${budgetSites.indexOf(site)}-${dept}`}>{cellError || (changed ? original === undefined ? '신규' : `기존 ${format(original)}원` : original === undefined ? '' : '등록됨')}</span></td>;
        })}<td className="budget-row-total">{budgetDepartments.some((dept) => edits.errors[budgetKey(site, dept)]) ? '-' : format(totals.find((item) => item.site === site).amount)}</td></tr>)}
      </tbody><tfoot><tr><th>부서별 합계</th>{budgetDepartments.map((dept) => <td key={dept}>{budgetSites.some((site) => edits.errors[budgetKey(site, dept)]) ? '-' : format(budgetSites.reduce((sum, site) => sum + (parseAmount(draft[budgetKey(site, dept)] ?? '') ?? 0), 0))}</td>)}<td>{invalid ? '-' : format(grandTotal)}</td></tr></tfoot></table></div>
      <div className="budget-savebar"><span>{saving ? '저장 중...' : edits.dirty ? '저장하지 않은 변경사항이 있습니다.' : '모든 변경사항이 저장되었습니다.'}</span><div><button className="ws-button" disabled={!edits.dirty || saving} onClick={() => { if (confirmDiscard()) { setDraft(toDraft(snapshot)); setError(''); setMessage(''); } }}><FiRotateCcw />변경 취소</button><button className="ws-button ws-button-primary" disabled={!edits.changes.length || invalid || saving} onClick={save}><FiSave />{saving ? '저장 중...' : `변경사항 저장${edits.changes.length ? ` (${edits.changes.length})` : ''}`}</button></div></div>
      <section className="budget-allocation"><header><h3>사업소별 예산 배분</h3><span>{edits.dirty ? '편집 금액 기준' : `${year}년 기준`}</span></header>{invalid ? <p>입력 금액을 확인해 주세요.</p> : totals.map(({ site, amount }) => <div className="budget-allocation-row" key={site}><span>{site}</span><div className="budget-allocation-track"><div style={{ width: `${grandTotal ? amount / grandTotal * 100 : 0}%` }} /></div><strong>{grandTotal ? `${(amount / grandTotal * 100).toFixed(1)}%` : '-'}</strong><span>{format(amount)}원</span></div>)}</section>
    </>}
  </WorkspaceLayout>;
}
