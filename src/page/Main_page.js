import React from 'react';
import WorkspaceLayout from '../layout/WorkspaceLayout';
import PersonalPortal from '../component/Portal/PersonalPortal';

export default function MainPage() {
  return <WorkspaceLayout title="마이 홈" className="ws-home-page" defaultSidebarOpen={false}><PersonalPortal /></WorkspaceLayout>;
}
