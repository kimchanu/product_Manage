import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useSearchParams } from 'react-router-dom';
import { locations } from '../component/Approval/approvalApi';
import WorkspaceLayout from '../layout/WorkspaceLayout';
import Dashboard from '../component/Dashboard';

export default function DashboardPage() {
  const [params] = useSearchParams();
  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    const linkedSite = locations.find(([code]) => code === params.get('site'));
    if (linkedSite) return linkedSite[1];
    try { return jwtDecode(localStorage.getItem('authToken')).business_location || 'GK사업소'; } catch { return 'GK사업소'; }
  });
  return <WorkspaceLayout title="대시보드" className="ws-dashboard-page" defaultSidebarOpen={false} sidebarProps={{ selectedDepartment, onSelectDepartment: setSelectedDepartment }}>
    <Dashboard department={selectedDepartment} onSiteChange={setSelectedDepartment} />
  </WorkspaceLayout>;
}
