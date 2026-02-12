import React, { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Output_Statistics from "../component/Output_Statistics";
import Sidebar from "../layout/Side_Bar";

function Output_Statistics_page() {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // ✅ 추가

  // 사업소 이름을 코드로 변환하는 함수
  const convertLocationToCode = (locationName) => {
    if (!locationName) return null;
    if (locationName === "GK사업소") return "GK";
    return locationName;
  };

  const handleDepartmentSelect = (department) => setSelectedDepartment(department);
  const handleDeptSelect = (dept) => setSelectedDept(dept);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1 bg-gray-50">
        {/* ✅ Sidebar: 열려있을 때만 렌더링 */}
        {sidebarOpen && (
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen(false)}
            onSelectDepartment={handleDepartmentSelect}
            selectedDepartment={selectedDepartment}
            onSelectDept={handleDeptSelect}
            selectedDept={selectedDept}
          />
        )}

        <main className="flex-1 p-4 relative">
          {/* ✅ 닫혀있을 때 열기 버튼 */}
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="fixed top-1/2 left-0 -translate-y-1/2 w-6 h-12 bg-gray-200 border border-gray-300 rounded-r-md flex items-center justify-center hover:bg-gray-300 shadow z-40"
              aria-label="사이드바 열기"
            >
              <span className="text-sm font-bold">▶</span>
            </button>
          )}

          <Output_Statistics
            selectedBusinessLocation={convertLocationToCode(selectedDepartment)}
            selectedDept={selectedDept}
          />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default Output_Statistics_page;