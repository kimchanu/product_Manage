import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useSearchParams } from 'react-router-dom';
import { businessLocations, normalizeLocation } from '../utils/businessLocation';
import WorkspaceLayout from '../layout/WorkspaceLayout';
import Dashboard from '../component/Dashboard';

export default function DashboardPage() {
  const [params] = useSearchParams();
  const [selectedBusinessLocation, setSelectedBusinessLocation] = useState(() => {
    const linkedSite = normalizeLocation(params.get('site'));
    if (businessLocations.includes(linkedSite)) return linkedSite;
    try { return normalizeLocation(jwtDecode(localStorage.getItem('authToken')).business_location) || 'GK사업소'; } catch { return 'GK사업소'; }
  });
  return <WorkspaceLayout title="대시보드" className="ws-dashboard-page" defaultSidebarOpen={false} sidebarProps={{ selectedBusinessLocation, onSelectBusinessLocation: setSelectedBusinessLocation }}>
    <Dashboard businessLocation={selectedBusinessLocation} onSiteChange={setSelectedBusinessLocation} />
  </WorkspaceLayout>;
}
