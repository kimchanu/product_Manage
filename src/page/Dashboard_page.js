import React, { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Statistics_sub from "../component/Dashboard";
import Sidebar from "../layout/Side_Bar";

function Dashboard_page() {
  const [selectedDepartment, setSelectedDepartment] = useState("GK사업소");
  const [sidebarOpen, setSidebarOpen] = useState(true); // ✅ 추가

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 bg-gray-50 border">
        {/* ✅ Sidebar가 열려있을 때만 렌더링 (닫히면 main이 공간 전부 차지) */}
        {sidebarOpen && (
          <Sidebar
            open={sidebarOpen} // ✅ Sidebar 버튼 화살표 표시용
            onToggle={() => setSidebarOpen(false)} // ✅ Sidebar 안 버튼 누르면 닫힘
            onSelectDepartment={setSelectedDepartment}
            selectedDepartment={selectedDepartment}
          />
        )}

        <main className="flex-1 p-6 overflow-auto border relative">
          {/* ✅ Sidebar가 닫혔을 때, 왼쪽 중앙에 '열기' 버튼 표시 */}
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="absolute top-1/2 left-0 -translate-y-1/2 w-6 h-12 bg-gray-200 border border-gray-300 rounded-r-md flex items-center justify-center hover:bg-gray-300 shadow"
              aria-label="사이드바 열기"
            >
              <span className="text-sm font-bold">▶</span>
            </button>
          )}

          <Statistics_sub department={selectedDepartment} />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard_page;