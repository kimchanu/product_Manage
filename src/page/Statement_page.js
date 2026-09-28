import React, { useState } from 'react';
import WorkspaceLayout from '../layout/WorkspaceLayout';
import Statement from '../component/Statement';
export default function StatementPage() {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  return <WorkspaceLayout title="자재수불명세서" className="ws-statement-page" sidebarProps={{ selectedDepartment, onSelectDepartment: setSelectedDepartment }}>
    <Statement selectedBusinessLocation={selectedDepartment === 'GK사업소' ? 'GK' : selectedDepartment} />
  </WorkspaceLayout>;
}
