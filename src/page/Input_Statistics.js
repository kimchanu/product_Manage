import React, { useState } from 'react';
import WorkspaceLayout from '../layout/WorkspaceLayout';
import InputStatistics from '../component/InputStatistics';
export default function InputStatisticsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  return <WorkspaceLayout title="입고 통계" className="ws-statistics-page" sidebarProps={{ selectedDepartment, onSelectDepartment: setSelectedDepartment, selectedDept, onSelectDept: setSelectedDept }}>
    <InputStatistics selectedBusinessLocation={selectedDepartment === 'GK사업소' ? 'GK' : selectedDepartment} selectedDept={selectedDept} />
  </WorkspaceLayout>;
}
