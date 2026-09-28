import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FiBox, FiGrid, FiMessageSquare, FiDownload, FiUpload, FiFileText, FiEdit,
  FiChevronDown, FiSettings, FiDollarSign, FiUser } from 'react-icons/fi';
import './Side_Bar.css';

export default function Sidebar({ onSelectDepartment, selectedDepartment, onSelectDept, selectedDept }) {
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState({ input: true, output: true });
  let user = {};
  try { user = jwtDecode(localStorage.getItem('authToken')); } catch { /* Route guard handles missing tokens. */ }
  const restricted = user.business_location === '본사' || user.department === '관리';
  const isAdmin = Number(user.admin || 0) >= 1;
  useEffect(() => {
    if (['/upload', '/input_mod', '/input_statistics', '/Input_manual_page', '/statistics/input'].includes(pathname)) setExpanded((prev) => ({ ...prev, input: true }));
    if (['/Mat_output_page', '/Output_Mod', '/Output_Statistics_page', '/statistics/output'].includes(pathname)) setExpanded((prev) => ({ ...prev, output: true }));
  }, [pathname]);
  const item = (to, label, Icon, child = false) => <NavLink key={to} to={to} className={({ isActive }) => `ws-nav-link ${child ? 'ws-nav-child' : ''} ${isActive ? 'active' : ''}`}><Icon /><span>{label}</span></NavLink>;
  const group = (key, label, Icon, children) => <div className="ws-nav-group"><button className="ws-nav-group-title" aria-expanded={expanded[key]} onClick={() => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}><Icon /><span>{label}</span><FiChevronDown className={expanded[key] ? 'expanded' : ''} /></button>{expanded[key] && <div>{children}</div>}</div>;
  return <aside className="sidebar-panel">
    <div className="sidebar-menu-title"><FiBox /><span>자재관리</span></div>
    <nav className="sidebar-menu-list" aria-label="업무 메뉴">
      {item('/dashboard', '대시보드', FiGrid)}
      {item('/PostList_page', '게시판', FiMessageSquare)}
      {group('input', '입고관리', FiDownload, <>
        {!restricted && item('/upload', '입고 등록', FiDownload, true)}
        {!restricted && item('/input_mod', '입고 현황', FiFileText, true)}
        {item('/input_statistics', '입고 통계', FiGrid, true)}
      </>)}
      {item('/Mat_list_page', '자재목록', FiBox)}
      {group('output', '출고관리', FiUpload, <>
        {!restricted && item('/Mat_output_page', '출고 등록', FiUpload, true)}
        {!restricted && item('/Output_Mod', '출고 현황', FiFileText, true)}
        {item('/Output_Statistics_page', '출고 통계', FiGrid, true)}
      </>)}
      {item('/Statement_page', '자재수불명세서', FiFileText)}
      {item('/statement-approvals', '전자결재', FiEdit)}
      {isAdmin && <div className="ws-nav-admin">{item('/admin', '관리자', FiSettings)}{item('/Budget', '예산 관리', FiDollarSign)}{item('/Input_manual_page', '수동 입고', FiEdit)}</div>}
      {item('/mypage', '마이페이지', FiUser)}
    </nav>
    <div className="ws-sidebar-context">
      <label>사업소{onSelectDepartment ? <select aria-label="사업소" value={selectedDepartment || (user.business_location === 'GK' ? 'GK사업소' : user.business_location) || ''} onChange={(e) => { onSelectDepartment(e.target.value); onSelectDept?.(null); }}><option value="">사업소 선택</option>{['GK사업소', '천마사업소', '을숙도사업소', '강남사업소', '수원사업소', '본사'].map((site) => <option key={site}>{site}</option>)}</select> : <span>{user.business_location || '-'}</span>}</label>
      {onSelectDept ? <label>부서<select aria-label="부서" value={selectedDept || ''} onChange={(e) => onSelectDept(e.target.value || null)}><option value="">내 부서</option>{['ITS', '시설', '기전'].map((dept) => <option key={dept}>{dept}</option>)}</select></label> : <label>부서<span>{user.department || '-'}</span></label>}
    </div>
  </aside>;
}
