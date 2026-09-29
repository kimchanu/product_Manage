import React, { useState } from 'react';
import WorkspaceLayout from '../layout/WorkspaceLayout';
import Statement from '../component/Statement';
export default function StatementPage() {
  const [selectedBusinessLocation, setSelectedBusinessLocation] = useState(null);
  return <WorkspaceLayout title="자재수불명세서" className="ws-statement-page" sidebarProps={{ selectedBusinessLocation, onSelectBusinessLocation: setSelectedBusinessLocation }}>
    <Statement selectedBusinessLocation={selectedBusinessLocation} />
  </WorkspaceLayout>;
}
