import React, { useState } from 'react';
import { FiSidebar, FiChevronRight, FiGrid } from 'react-icons/fi';
import Header from './Header';
import Sidebar from './Side_Bar';
import Footer from './Footer';
import './WorkspaceLayout.css';

export default function WorkspaceLayout({ title, children, sidebarProps = {}, className = '', actions, defaultSidebarOpen = true }) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);
  return <div className={`workspace-app ${className}`}>
    <Header />
    <div className={`ws-layout ${sidebarOpen ? '' : 'ws-sidebar-closed'}`}>
      {sidebarOpen && <Sidebar {...sidebarProps} />}
      <main className="ws-main">
        <div className="ws-page-toolbar no-print">
          <button type="button" className="ws-icon" title={sidebarOpen ? '메뉴 접기' : '메뉴 펼치기'} aria-label={sidebarOpen ? '메뉴 접기' : '메뉴 펼치기'} aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)}><FiSidebar /></button>
          <h1><FiGrid />{title}</h1>
          {actions && <div className="ws-page-actions">{actions}</div>}
          <span className="ws-breadcrumb">자재관리<FiChevronRight />{title}</span>
        </div>
        <div className="ws-content">{children}</div>
      </main>
    </div>
    <Footer />
  </div>;
}
