import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FiUser, FiChevronLeft, FiChevronRight, FiEdit, FiInbox, FiSend, FiUsers, FiBox, FiDownload, FiUpload, FiGrid, FiPlus, FiTrash2, FiExternalLink } from 'react-icons/fi';
import WorkspaceDialog from '../WorkspaceDialog';
import { documentTitle, normalizeLocation } from '../Approval/approvalApi';
import bridge from '../../image/main1.jpg';
import './PersonalPortal.css';
import InventorySummary from '../Statistics/InventorySummary';

const shortDate = (value) => value ? new Date(value).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : '';
const shortcuts = [['compose', '기안작성', FiEdit], ['pending', '미결문서', FiInbox], ['progress', '진행문서', FiSend], ['circulation', '회람문서', FiUsers]];
const workLinks = [['/dashboard', '대시보드', FiGrid], ['/Mat_list_page', '자재목록', FiBox], ['/upload', '입고 등록', FiDownload], ['/Mat_output_page', '출고 등록', FiUpload]];

export default function PersonalPortal({ businessLocation }) {
  const user = useMemo(() => { try { return jwtDecode(localStorage.getItem('authToken')); } catch { return {}; } }, []);
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [boardTab, setBoardTab] = useState('all');
  const [docTab, setDocTab] = useState('mine');
  const [closedPopups, setClosedPopups] = useState([]);
  const [hideToday, setHideToday] = useState(false);
  const location = normalizeLocation(businessLocation || user.business_location);
  const userId = user.user_id || user.id;
  useEffect(() => {
    const controller = new AbortController();
    setData({}); setErrors({});
    const paths = { board: '/api/posts?limit=5', mine: '/api/user/activity', docs: `/api/statement/approval/workspace/documents?businessLocation=${encodeURIComponent(location)}`, popups: '/api/admin/popups/active' };
    Object.entries(paths).forEach(async ([key, path]) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}${path}`, { signal: controller.signal, headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
        if (!response.ok) throw new Error('불러오지 못했습니다.');
        const value = await response.json();
        if (!controller.signal.aborted) setData((prev) => ({ ...prev, [key]: value }));
      } catch (error) { if (!controller.signal.aborted) setErrors((prev) => ({ ...prev, [key]: error.message })); }
    });
    return () => controller.abort();
  }, [location, userId]);
  const documents = data.docs?.documents || [];
  const ownDocs = documents.filter((doc) => Number(doc.requester_user_id) === Number(userId));
  const pending = documents.filter((doc) => Number(doc.can_approve));
  const circulated = documents.filter((doc) => Number(doc.is_circulation));
  const displayedDocs = (docTab === 'pending' ? pending : docTab === 'circulation' ? circulated : ownDocs).slice(0, 5);
  const posts = (data.board?.posts || []).filter((post) => boardTab !== 'notice' || Number(post.is_notice));
  const popup = (data.popups?.popups || []).find((item) => {
    if (closedPopups.includes(item.id)) return false;
    try { return Number(localStorage.getItem(`popup:${userId}:${item.id}:${item.updated_at}`)) <= Date.now(); } catch { return true; }
  });
  const closePopup = () => {
    if (hideToday) {
      const tomorrow = new Date(); tomorrow.setHours(24, 0, 0, 0);
      try { localStorage.setItem(`popup:${userId}:${popup.id}:${popup.updated_at}`, String(tomorrow.getTime())); } catch { /* Storage can be unavailable. */ }
    }
    setClosedPopups((prev) => [...prev, popup.id]); setHideToday(false);
  };
  const safeLink = (value) => { try { const url = new URL(value, window.location.origin); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; } };
  return <>
    <div className="portal-grid">
      <aside className="portal-left">
        <PortalSection title="내 정보" to="/mypage">
          <div className="portal-profile"><span className="portal-avatar"><FiUser /></span><div><strong>{user.full_name || '사용자'} 님</strong><p>{user.business_location} · {user.department}</p><Link to="/mypage">마이페이지<FiChevronRight /></Link></div></div>
          <div className="portal-counters"><Link to="/statement-approvals?folder=pending">미결문서<strong>{data.docs ? pending.length : '-'}</strong></Link><Link to="/statement-approvals?folder=circulation">미열람 회람<strong>{data.docs ? circulated.filter((doc) => !doc.read_at).length : '-'}</strong></Link></div>
        </PortalSection>
        <Calendar />
        <PortalSection title="업무 바로가기"><nav className="portal-work-links">{workLinks.map(([to, label, Icon]) => <Link key={to} to={to}><Icon />{label}<FiChevronRight /></Link>)}</nav></PortalSection>
      </aside>
      <div className="portal-center">
        <div className="portal-banner"><img src={bridge} alt="사업소 전경" /><div><span>KOINFRA</span><strong>{businessLocation || user.business_location || '자재관리'}</strong></div></div>
        <nav className="portal-shortcuts" aria-label="전자결재 바로가기">{shortcuts.map(([folder, label, Icon]) => <Link key={folder} to={`/statement-approvals?${folder === 'compose' ? 'compose=1' : `folder=${folder}`}`}><Icon /><span>{label}</span></Link>)}</nav>
        <InventorySummary defaultSite={user.business_location} />
        <PortalSection title="게시판" to="/PostList_page" tabs={<PortalTabs value={boardTab} onChange={setBoardTab} items={[['all', '최근 글'], ['notice', '공지']]} />}>
          <PortalRows loading={!data.board} error={errors.board} rows={posts.map((post) => ({ id: post.id, title: post.title, to: `/posts/${post.id}`, tag: Number(post.is_notice) ? '공지' : '', meta: shortDate(post.created_at) }))} empty="등록된 게시글이 없습니다." />
        </PortalSection>
        <PortalSection title="전자결재" to={`/statement-approvals?folder=${docTab === 'mine' ? 'progress' : docTab}`} tabs={<PortalTabs value={docTab} onChange={setDocTab} items={[['mine', '내 기안'], ['pending', '미결'], ['circulation', '회람']]} />}>
          <PortalRows loading={!data.docs} error={errors.docs} rows={displayedDocs.map((doc) => ({ id: doc.id, title: documentTitle(doc), to: `/statement-approvals?document=${doc.id}`, tag: doc.status === 'approved' ? '완료' : '대기', meta: shortDate(doc.submitted_at || doc.created_at) }))} empty="해당 결재 문서가 없습니다." />
        </PortalSection>
      </div>
      <aside className="portal-right">
        <PortalSection title="내가 쓴 글" to="/WritePost" linkLabel="글쓰기"><PortalRows loading={!data.mine} error={errors.mine} rows={(data.mine?.posts || []).map((post) => ({ id: post.id, title: post.title, to: `/posts/${post.id}`, meta: shortDate(post.created_at) }))} empty="작성한 게시글이 없습니다." /></PortalSection>
        <Tasks key={userId} userId={userId} />
        <PortalSection title="내 문서함"><nav className="portal-work-links"><Link to="/statement-approvals?folder=drafts"><FiEdit />임시저장문서<FiChevronRight /></Link><Link to="/Statement_page"><FiInbox />자재수불명세서<FiChevronRight /></Link><Link to="/statement-approvals?folder=complete"><FiSend />완결문서<FiChevronRight /></Link></nav></PortalSection>
      </aside>
    </div>
    {errors.popups && <p className="portal-load-error" role="status">팝업 공지를 불러오지 못했습니다.</p>}
    {popup && <WorkspaceDialog key={popup.id} title={popup.title} onClose={closePopup}><p className="portal-popup-content">{popup.content}</p>{popup.link_url && safeLink(popup.link_url) && <a className="ws-button" href={safeLink(popup.link_url)} target="_blank" rel="noreferrer">자세히 보기<FiExternalLink /></a>}<div className="ws-dialog-actions"><label className="ws-dialog-check"><input type="checkbox" checked={hideToday} onChange={(event) => setHideToday(event.target.checked)} />오늘 보지 않기</label><button className="ws-button" onClick={closePopup}>닫기</button></div></WorkspaceDialog>}
  </>;
}

function PortalSection({ title, to, linkLabel = '더 보기', tabs, children }) {
  return <section className="portal-section"><header><h2>{title}</h2>{tabs}{to && <Link to={to} title={`${title} ${linkLabel}`}>{linkLabel}<FiChevronRight /></Link>}</header>{children}</section>;
}
function PortalTabs({ value, onChange, items }) {
  return <div className="portal-tabs">{items.map(([key, label]) => <button key={key} type="button" aria-pressed={value === key} onClick={() => onChange(key)}>{label}</button>)}</div>;
}
function PortalRows({ rows, loading, error, empty }) {
  if (error || loading || !rows.length) return <p className={`portal-empty ${error ? 'portal-load-error' : ''}`} role="status">{error || (loading ? '불러오는 중...' : empty)}</p>;
  return <ul className="portal-rows">{rows.map((row) => <li key={row.id}><Link to={row.to} title={row.title}>{row.tag && <span className="portal-row-tag">{row.tag}</span>}<span className="portal-row-title">{row.title}</span><time>{row.meta}</time></Link></li>)}</ul>;
}
function Calendar() {
  const today = new Date();
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const cells = Array.from({ length: 42 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), 1 - month.getDay() + index));
  return <PortalSection title="달력"><div className="portal-calendar-toolbar"><button className="ws-icon" aria-label="이전 달" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><FiChevronLeft /></button><strong>{month.getFullYear()}. {String(month.getMonth() + 1).padStart(2, '0')}</strong><button className="ws-icon" aria-label="다음 달" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><FiChevronRight /></button><button onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>오늘</button></div><div className="portal-calendar">{['일', '월', '화', '수', '목', '금', '토'].map((day) => <b key={day}>{day}</b>)}{cells.map((day) => <span key={day.toISOString()} className={`${day.getMonth() !== month.getMonth() ? 'outside' : ''} ${day.toDateString() === today.toDateString() ? 'today' : ''}`} aria-current={day.toDateString() === today.toDateString() ? 'date' : undefined}>{day.getDate()}</span>)}</div></PortalSection>;
}
function Tasks({ userId }) {
  const storageKey = `portal-tasks:${userId}`;
  const [tasks, setTasks] = useState(() => { try { const stored = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(stored) ? stored.filter((item) => item && typeof item.text === 'string') : []; } catch { return []; } });
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const update = (next) => { setTasks(next); try { localStorage.setItem(storageKey, JSON.stringify(next)); setError(''); } catch { setError('이 브라우저에 저장하지 못했습니다.'); } };
  return <PortalSection title="할 일"><form className="portal-task-form" onSubmit={(event) => { event.preventDefault(); if (!input.trim()) return; update([...tasks, { id: `${Date.now()}-${Math.random()}`, text: input.trim(), done: false }]); setInput(''); }}><input aria-label="새 할 일" value={input} maxLength={120} onChange={(event) => setInput(event.target.value)} placeholder="할 일 추가" /><button type="submit" className="ws-icon" title="할 일 추가" aria-label="할 일 추가"><FiPlus /></button></form><ul className="portal-tasks">{tasks.map((task) => <li key={task.id}><label><input type="checkbox" checked={Boolean(task.done)} onChange={() => update(tasks.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))} /><span className={task.done ? 'done' : ''}>{task.text}</span></label><button className="ws-icon" title="할 일 삭제" aria-label={`${task.text} 삭제`} onClick={() => update(tasks.filter((item) => item.id !== task.id))}><FiTrash2 /></button></li>)}</ul>{!tasks.length && <p className="portal-empty">등록된 할 일이 없습니다.</p>}{error && <p role="alert">{error}</p>}</PortalSection>;
}
