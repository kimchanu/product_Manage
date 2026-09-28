import React, { useEffect, useState } from 'react';
import { FiFolder, FiFileText, FiChevronRight, FiSave, FiSend } from 'react-icons/fi';
import ApprovalDialog from './ApprovalDialog';
import ApprovalReport from './ApprovalReport';
import { approvalApi, periodLabel } from './approvalApi';

export function ApprovalTemplates({ onClose, onSelect }) {
  const [folder, setFolder] = useState('materials');
  return <ApprovalDialog title="기안작성 · 양식 선택" onClose={onClose} wide>
    <div className="ap-template-browser">
      <nav className="ap-folder-tree" aria-label="양식함">
        <button onClick={() => setFolder('all')} className={folder === 'all' ? 'active' : ''}><FiFolder /> 양식함</button>
        <button onClick={() => setFolder('materials')} className={`ap-child ${folder === 'materials' ? 'active' : ''}`}><FiFolder /> 자재관리</button>
      </nav>
      <div className="ap-template-list"><table><thead><tr><th>No</th><th>양식명</th><th>구분</th><th aria-label="선택" /></tr></thead>
        <tbody><tr><td>1</td><td><button className="ap-title-link" onClick={onSelect}><FiFileText /> 자재수불명세서 월간보고서</button></td><td>자재관리</td><td><button className="ap-icon" aria-label="월간보고서 작성" title="월간보고서 작성" onClick={onSelect}><FiChevronRight /></button></td></tr></tbody>
      </table></div>
    </div>
  </ApprovalDialog>;
}

export default function ApprovalComposer({ user, businessLocation, initial, onClose, onSaved }) {
  const today = new Date();
  const [form, setForm] = useState(() => initial || {
    businessLocation, department: ['ITS', '시설', '기전'].includes(user.department) ? user.department : 'ITS',
    year: today.getFullYear(), month: today.getMonth() + 1, title: '', content: '', recipients: [],
  });
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [metaError, setMetaError] = useState('');
  const [recipientSearch, setRecipientSearch] = useState('');
  const title = form.title || `${periodLabel(form.year, form.month)} ${form.department} 자재수불명세서`;
  const isAdmin = Number(user.admin || 0) >= 1;
  useEffect(() => {
    let active = true;
    setMeta(null); setMetaError('');
    const params = new URLSearchParams({ businessLocation: form.businessLocation, department: form.department, year: form.year, month: form.month });
    Promise.all([approvalApi(`/meta?${params}`), approvalApi(`/workspace/recipients?businessLocation=${encodeURIComponent(form.businessLocation)}`)])
      .then(([info, people]) => { if (active) { setMeta(info); setUsers(people.users || []); } })
      .catch((err) => { if (active) setMetaError(err.message); });
    return () => { active = false; };
  }, [form.businessLocation, form.department, form.year, form.month]);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const close = () => { if (!busy && window.confirm('작성을 닫으시겠습니까? 저장하지 않은 내용은 사라집니다.')) onClose(); };
  const save = async (submit) => {
    if (submit && !window.confirm(`${periodLabel(form.year, form.month)} 보고서를 ${meta?.setting?.approver_name}님에게 상신하시겠습니까?`)) return;
    setBusy(true); setError('');
    try {
      const result = await approvalApi(`/workspace/${submit ? 'submit' : 'drafts'}`, { method: 'POST', body: JSON.stringify({ ...form, title }) });
      onSaved(result.message, submit ? 'progress' : 'drafts');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <ApprovalDialog title="기안작성 · 자재수불명세서" onClose={close} wide>
    <div className="ap-compose-toolbar"><span><FiFileText /> 월간보고서</span><div><button className="ap-button" disabled={busy} onClick={() => save(false)}><FiSave /> 임시저장</button><button className="ap-button ap-primary" disabled={busy || !meta?.setting || !!meta?.document} onClick={() => save(true)}><FiSend /> {busy ? '처리 중' : '상신'}</button></div></div>
    <div className="ap-compose-body">
      {(error || metaError) && <p role="alert" className="ap-error">{error || metaError}</p>}
      {meta && !meta.setting && <p className="ap-notice">지정된 승인자가 없습니다. 관리자 페이지에서 승인자를 지정해 주세요.</p>}
      {meta?.document && <p className="ap-notice">해당 월에 이미 상신된 문서가 있습니다. 문서함에서 확인해 주세요.</p>}
      <div className="ap-form-grid">
        <label>기안자<input readOnly value={`${user.name} / ${user.department}`} /></label>
        <label>결재자<input readOnly value={meta?.setting?.approver_name || (metaError ? '조회 실패' : meta ? '미지정' : '조회 중')} /></label>
        <label>부서<select aria-label="보고 부서" value={form.department} disabled={!isAdmin || busy} onChange={(e) => update('department', e.target.value)}>{['ITS', '시설', '기전'].map((dept) => <option key={dept}>{dept}</option>)}</select></label>
        <label>보고 기간<div className="ap-period"><input aria-label="보고 연도" type="number" min="2000" max="2100" value={form.year} disabled={busy} onChange={(e) => update('year', Number(e.target.value))} /><span>년</span><select aria-label="보고 월" value={form.month} disabled={busy} onChange={(e) => update('month', Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}월</option>)}</select></div></label>
        <label className="ap-full">제목<input maxLength={255} value={title} disabled={busy} onChange={(e) => update('title', e.target.value)} /></label>
        <label className="ap-full">기안 내용<textarea rows={5} maxLength={10000} value={form.content} disabled={busy} onChange={(e) => update('content', e.target.value)} /></label>
      </div>
      <ApprovalReport businessLocation={form.businessLocation} department={form.department} year={form.year} month={form.month} />
      <div className="ap-section-heading"><h3>회람자 <span>{form.recipients.length}명</span></h3><input aria-label="회람자 검색" placeholder="이름 · 부서 검색" value={recipientSearch} onChange={(e) => setRecipientSearch(e.target.value)} /></div>
      <div className="ap-recipients">{users.filter((person) => `${person.full_name} ${person.department}`.includes(recipientSearch)).map((person) => <label key={person.id}><input type="checkbox" checked={form.recipients.includes(Number(person.id))} disabled={busy} onChange={(e) => update('recipients', e.target.checked ? [...form.recipients, Number(person.id)] : form.recipients.filter((id) => id !== Number(person.id)))} /><span>{person.full_name}<small>{person.department} · {person.position}</small></span></label>)}{!users.length && <p>조회된 회람자가 없습니다.</p>}</div>
    </div>
    <div className="ap-dialog-footer"><button className="ap-button" disabled={busy} onClick={close}>닫기</button></div>
  </ApprovalDialog>;
}
