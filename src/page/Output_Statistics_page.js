import React, { useState } from 'react';
import WorkspaceLayout from '../layout/WorkspaceLayout';
import OutputStatistics from '../component/Output_Statistics';
export default function OutputStatisticsPage() {
  const [selectedBusinessLocation, setSelectedBusinessLocation] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  return <WorkspaceLayout title="출고 통계" className="ws-statistics-page" sidebarProps={{ selectedBusinessLocation, onSelectBusinessLocation: setSelectedBusinessLocation, selectedDept, onSelectDept: setSelectedDept }}>
    <OutputStatistics selectedBusinessLocation={selectedBusinessLocation} selectedDept={selectedDept} />
  </WorkspaceLayout>;
}
