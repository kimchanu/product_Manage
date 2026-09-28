import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiEdit, FiInbox, FiSend, FiUsers, FiCheckCircle, FiFileText, FiSave, FiHome,
  FiSearch, FiRefreshCw, FiPrinter, FiTrash2, FiChevronLeft, FiChevronRight,
  FiChevronsLeft, FiChevronsRight, FiGrid, FiX, FiSliders } from 'react-icons/fi';
import ApprovalComposer, { ApprovalTemplates } from './ApprovalComposer';
import ApprovalDialog from './ApprovalDialog';
import ApprovalReport from './ApprovalReport';
import { approvalApi, dateLabel, documentTitle, locations, normalizeLocation, periodLabel } from './approvalApi';

const folders = [
  ['all', '대문', FiHome], ['pending', '미결문서', FiInbox], ['circulation', '회람문서', FiUsers],
  ['progress', '진행문서', FiSend], ['department', '부서진행문서', FiFileText],
  ['complete', '완결문서', FiCheckCircle], ['drafts', '임시저장문서', FiSave],
];
const matchesFolder = (doc, folder, user) => {
  if (folder === 'pending') return Boolean(Number(doc.can_approve));
  if (folder === 'circulation') return Boolean(Number(doc.is_circulation));
  if (folder === 'progress') return doc.status === 'submitted' && Number(doc.requester_user_id) === Number(user.user_id);
  if (folder === 'department') return doc.status === 'submitted' && doc.department === user.department;
  if (folder === 'complete') return doc.status === 'approved';
  return true;
};
const statusLabels = { submitted: '결재대기', approved: '결재완료', draft: '임시저장' };
const documentNumber = (doc) => doc.status === 'draft' ? '-' : `${doc.business_location}-${doc.report_year}-${String(doc.id).padStart(4, '0')}`;

function ToolButton({ icon: Icon, label, ...props }) {
  return <button type="button" className="ap-tool" title={label} {...props}><Icon /><span>{label}</span></button>;
}

export default function ApprovalWorkspace({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [location, setLocation] = useState(normalizeLocation(user.business_location));
  const [folder, setFolder] = useState(() => folders.some(([key]) => key === searchParams.get('folder')) ? searchParams.get('folder') : 'all');
  const [documents, setDocuments] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [unread, setUnread] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(() => searchParams.get('compose') === '1' ? { type: 'templates' } : null);
  const searchRef = useRef(null);
  const requestVersion = useRef(0);
  const isAdmin = Number(user.admin || 0) >= 1;

  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ businessLocation: location });
      const [docs, saved] = await Promise.all([approvalApi(`/workspace/documents?${params}`), approvalApi(`/workspace/drafts?${params}`)]);
      if (version !== requestVersion.current) return;
      setDocuments(docs.documents || []); setDrafts(saved.drafts || []);
    } catch (err) {
      if (version === requestVersion.current) { setDocuments([]); setDrafts([]); setError(err.message); }
    } finally { if (version === requestVersion.current) setLoading(false); }
  }, [location]);
  useEffect(() => { load(); return () => { requestVersion.current += 1; }; }, [load]);
  useEffect(() => { setPage(1); setSelected(null); }, [folder, query, department, year, month, unread, pageSize, location]);

  const draftRows = useMemo(() => drafts.map((doc) => ({ ...doc, status: 'draft', business_location: doc.businessLocation,
    report_year: doc.year, report_month: doc.month, requester_name: user.name })), [drafts, user.name]);
  const filtered = useMemo(() => {
    const rows = folder === 'drafts' ? draftRows : documents.filter((doc) => matchesFolder(doc, folder, user));
    return rows.filter((doc) => (!department || doc.department === department)
      && (!year || Number(doc.report_year) === Number(year)) && (!month || Number(doc.report_month) === Number(month))
      && (!(unread && folder === 'circulation') || !doc.read_at)
      && `${documentTitle(doc)} ${documentNumber(doc)} ${doc.requester_name}`.toLowerCase().includes(query.toLowerCase().trim()));
  }, [draftRows, documents, folder, user, department, year, month, unread, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedDoc = rows.find((doc) => doc.id === selected);
  const activeLabel = folders.find(([key]) => key === folder)?.[1];
  const counts = Object.fromEntries(folders.map(([key]) => [key, key === 'drafts' ? drafts.length : documents.filter((doc) => matchesFolder(doc, key, user)).length]));

  const changeFolder = (next) => { setFolder(next); setMessage(''); };
  const openDocument = async (doc) => {
    if (doc.status === 'draft') { setModal({ type: 'compose', draft: drafts.find((item) => item.id === doc.id) }); return; }
    setModal({ type: 'document', doc });
    if (Number(doc.is_circulation) && !doc.read_at) {
      try {
        await approvalApi(`/workspace/documents/${doc.id}/read`, { method: 'POST' });
        await load();
      } catch (err) { setError(err.message); }
    }
  };
  useEffect(() => {
    const documentId = searchParams.get('document');
    if (!documentId || loading || error) return;
    const doc = documents.find((item) => String(item.id) === documentId);
    setSearchParams({}, { replace: true });
    if (doc) openDocument(doc);
    else setError('문서를 찾을 수 없거나 열람 권한이 없습니다.');
    // Consume the link once after the authorized document list has loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, documents, loading, error]);
  const approve = async (doc) => {
    if (!window.confirm(`${documentTitle(doc)} 문서를 결재하시겠습니까? 해당 월과 이전 입출고 데이터가 잠깁니다.`)) return;
    setBusy(true); setError('');
    try {
      const result = await approvalApi('/approve', { method: 'POST', body: JSON.stringify({ businessLocation: doc.business_location, department: doc.department, year: doc.report_year, month: doc.report_month }) });
      setModal(null); setMessage(result.message); await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const deleteDraft = async () => {
    if (!selectedDoc || !window.confirm('선택한 임시저장 문서를 삭제하시겠습니까?')) return;
    setBusy(true);
    try {
      const result = await approvalApi(`/workspace/drafts/${selectedDoc.id}`, { method: 'DELETE' });
      setSelected(null); setMessage(result.message); await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const saved = (text, nextFolder) => { setModal(null); setMessage(text); setFolder(nextFolder); setSelected(null); load(); };

  return <div className="ap-workspace">
    <aside className="ap-sidebar">
      <div className="ap-brand"><FiEdit /><h1>전자결재</h1></div>
      <button className="ap-new-draft" onClick={() => setModal({ type: 'templates' })}><FiEdit /> 기안작성</button>
      <nav aria-label="전자결재 문서함">{folders.map(([key, label, Icon]) => <button key={key} className={`ap-folder ${folder === key ? 'active' : ''}`} aria-current={folder === key ? 'page' : undefined} onClick={() => changeFolder(key)}><Icon /><span>{label}</span><span className="ap-count">{loading ? '-' : counts[key]}</span></button>)}</nav>
      <div className="ap-sidebar-bottom"><label>사업소<select aria-label="사업소" value={location} disabled={!isAdmin} onChange={(e) => { setLocation(e.target.value); setSelected(null); }}>{!locations.some(([code]) => code === location) && <option value={location}>{location}</option>}{locations.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label><Link to="/dashboard"><FiChevronLeft /> 자재관리로 돌아가기</Link></div>
    </aside>
    <main className="ap-main">
      <div className="ap-toolbar">
        <div className="ap-tools"><ToolButton icon={FiEdit} label="기안작성" onClick={() => setModal({ type: 'templates' })} /><ToolButton icon={FiFileText} label="결재현황" disabled={!selectedDoc || loading} onClick={() => openDocument(selectedDoc)} /><ToolButton icon={FiPrinter} label="인쇄" disabled={loading || !filtered.length} onClick={() => window.print()} /><ToolButton icon={FiTrash2} label="삭제" disabled={folder !== 'drafts' || !selectedDoc || busy} onClick={deleteDraft} /><span className="ap-divider" /><ToolButton icon={FiRefreshCw} label="새로고침" disabled={loading || busy} onClick={load} /><ToolButton icon={FiSearch} label="문서검색" onClick={() => searchRef.current?.focus()} /></div>
        <form className="ap-search" onSubmit={(event) => { event.preventDefault(); setQuery(search); }}><input ref={searchRef} aria-label="문서 검색" placeholder="제목 · 기안자 · 문서번호" value={search} onChange={(e) => setSearch(e.target.value)} /><button className="ap-icon" aria-label="검색" title="검색"><FiSearch /></button><button type="button" className={`ap-icon ${advanced ? 'active' : ''}`} aria-label="상세검색" title="상세검색" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}><FiSliders /></button></form>
      </div>
      {advanced && <div className="ap-advanced"><label>부서<select value={department} onChange={(e) => setDepartment(e.target.value)}><option value="">전체</option>{['ITS', '시설', '기전'].map((dept) => <option key={dept}>{dept}</option>)}</select></label><label>연도<input type="number" min="2000" max="2100" placeholder="전체" value={year} onChange={(e) => setYear(e.target.value)} /></label><label>월<select value={month} onChange={(e) => setMonth(e.target.value)}><option value="">전체</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}월</option>)}</select></label><button className="ap-button" onClick={() => { setDepartment(''); setYear(''); setMonth(''); setSearch(''); setQuery(''); setUnread(false); }}>초기화</button></div>}
      <div className="ap-content">
        <div className="ap-list-heading"><h2><FiGrid /> {activeLabel} <span>{loading ? '' : filtered.length}</span></h2>{folder === 'circulation' && <label><input type="checkbox" checked={unread} onChange={(e) => setUnread(e.target.checked)} /> 미열람 문서</label>}<span className="ap-breadcrumb">전자결재 <FiChevronRight /> {activeLabel}</span></div>
        {message && <div role="status" className="ap-success">{message}<button className="ap-icon" aria-label="알림 닫기" onClick={() => setMessage('')}><FiX /></button></div>}
        {error && <div role="alert" className="ap-error">{error}<button className="ap-button" onClick={load}>다시 시도</button></div>}
        <div className="ap-table-scroll"><table className="ap-documents"><colgroup><col style={{ width: 38 }} /><col style={{ width: 175 }} /><col /><col style={{ width: 90 }} /><col style={{ width: 145 }} /><col style={{ width: 145 }} /><col style={{ width: 95 }} /></colgroup>
          <thead><tr><th aria-label="문서 선택" /><th>문서번호</th><th>제목</th><th>기안자</th><th>{folder === 'drafts' ? '저장일시' : '결재완료일'}</th><th>열람일시</th><th>상태</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={7} className="ap-empty-cell" role="status">문서를 불러오는 중입니다.</td></tr> : !rows.length ? <tr><td colSpan={7}><div className="ap-empty"><FiInbox /><strong>{error ? '문서를 불러오지 못했습니다.' : query || department || year || month || unread ? '검색 결과가 없습니다.' : '문서가 없습니다.'}</strong></div></td></tr> : rows.map((doc) => <tr key={doc.id} className={`${selected === doc.id ? 'ap-selected' : ''} ${folder === 'circulation' && !doc.read_at ? 'ap-unread' : ''}`}><td><input type="checkbox" aria-label={`${documentTitle(doc)} 선택`} checked={selected === doc.id} onChange={(e) => setSelected(e.target.checked ? doc.id : null)} /></td><td className="ap-doc-number">{documentNumber(doc)}</td><td><button className="ap-title-link" onClick={() => openDocument(doc)} title={documentTitle(doc)}>{documentTitle(doc)}</button></td><td>{doc.requester_name}</td><td>{dateLabel(folder === 'drafts' ? doc.updated_at : doc.approved_at)}</td><td>{dateLabel(doc.read_at)}</td><td><span className={`ap-status ap-status-${doc.status}`}>{statusLabels[doc.status] || doc.status}</span></td></tr>)}</tbody>
        </table></div>
        <div className="ap-pagination"><label>목록건수 <select aria-label="목록건수" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>{[10, 20, 50].map((size) => <option key={size}>{size}</option>)}</select></label><div className="ap-page-buttons"><button className="ap-icon" aria-label="첫 페이지" title="첫 페이지" disabled={currentPage === 1} onClick={() => { setPage(1); setSelected(null); }}><FiChevronsLeft /></button><button className="ap-icon" aria-label="이전 페이지" title="이전 페이지" disabled={currentPage === 1} onClick={() => { setPage(currentPage - 1); setSelected(null); }}><FiChevronLeft /></button>{Array.from({ length: Math.min(5, pageCount) }, (_, i) => Math.max(1, Math.min(currentPage - 2, pageCount - 4)) + i).map((number) => <button key={number} className={`ap-icon ${number === currentPage ? 'active' : ''}`} aria-label={`${number}페이지`} aria-current={number === currentPage ? 'page' : undefined} onClick={() => { setPage(number); setSelected(null); }}>{number}</button>)}<button className="ap-icon" aria-label="다음 페이지" title="다음 페이지" disabled={currentPage === pageCount} onClick={() => { setPage(currentPage + 1); setSelected(null); }}><FiChevronRight /></button><button className="ap-icon" aria-label="마지막 페이지" title="마지막 페이지" disabled={currentPage === pageCount} onClick={() => { setPage(pageCount); setSelected(null); }}><FiChevronsRight /></button></div><span>현재 {currentPage}/{pageCount} · 총 {filtered.length}건</span></div>
      </div>
    </main>
    {modal?.type === 'templates' && <ApprovalTemplates onClose={() => setModal(null)} onSelect={() => setModal({ type: 'compose' })} />}
    {modal?.type === 'compose' && <ApprovalComposer user={user} businessLocation={location} initial={modal.draft} onClose={() => setModal(null)} onSaved={saved} />}
    {modal?.type === 'document' && <ApprovalDialog title="결재현황" onClose={() => { if (!busy) setModal(null); }} wide>
      <div className="ap-document-body"><div className="ap-document-heading"><span className={`ap-status ap-status-${modal.doc.status}`}>{statusLabels[modal.doc.status]}</span><h2>{documentTitle(modal.doc)}</h2><p>{documentNumber(modal.doc)}</p></div>
        {error && <p role="alert" className="ap-error">{error}</p>}
        <dl className="ap-document-meta"><div><dt>기안자</dt><dd>{modal.doc.requester_name} · {modal.doc.department}</dd></div><div><dt>결재자</dt><dd>{modal.doc.approver_name}</dd></div><div><dt>보고 기간</dt><dd>{periodLabel(modal.doc.report_year, modal.doc.report_month)}</dd></div><div><dt>상신일시</dt><dd>{dateLabel(modal.doc.submitted_at)}</dd></div><div><dt>결재완료일</dt><dd>{dateLabel(modal.doc.approved_at)}</dd></div></dl>
        {modal.doc.content && <div className="ap-document-content">{modal.doc.content}</div>}
        <ApprovalReport businessLocation={modal.doc.business_location} department={modal.doc.department} year={modal.doc.report_year} month={modal.doc.report_month} />
      </div>
      <div className="ap-dialog-footer"><button className="ap-button" onClick={() => window.print()}><FiPrinter /> 인쇄</button>{Number(modal.doc.can_approve) === 1 && <button className="ap-button ap-primary" disabled={busy} onClick={() => approve(modal.doc)}><FiCheckCircle /> {busy ? '처리 중' : '결재'}</button>}<button className="ap-button" disabled={busy} onClick={() => setModal(null)}>닫기</button></div>
    </ApprovalDialog>}
  </div>;
}
