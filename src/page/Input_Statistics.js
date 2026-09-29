import React, { useState } from 'react';
import WorkspaceLayout from '../layout/WorkspaceLayout';
import InputStatistics from '../component/InputStatistics';
export default function InputStatisticsPage() {
  const [selectedBusinessLocation, setSelectedBusinessLocation] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  return <WorkspaceLayout title="입고 통계" className="ws-statistics-page" sidebarProps={{ selectedBusinessLocation, onSelectBusinessLocation: setSelectedBusinessLocation, selectedDept, onSelectDept: setSelectedDept }}>
    <InputStatistics selectedBusinessLocation={selectedBusinessLocation} selectedDept={selectedDept} />
  </WorkspaceLayout>;
}
