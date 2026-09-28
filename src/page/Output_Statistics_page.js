import React, { useState } from 'react';
import WorkspaceLayout from '../layout/WorkspaceLayout';
import OutputStatistics from '../component/Output_Statistics';
export default function OutputStatisticsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  return <WorkspaceLayout title="출고 통계" className="ws-statistics-page" sidebarProps={{ selectedDepartment, onSelectDepartment: setSelectedDepartment, selectedDept, onSelectDept: setSelectedDept }}>
    <OutputStatistics selectedBusinessLocation={selectedDepartment === 'GK사업소' ? 'GK' : selectedDepartment} selectedDept={selectedDept} />
  </WorkspaceLayout>;
}
