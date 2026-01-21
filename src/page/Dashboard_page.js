import React, { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Statistics_sub from "../component/Dashboard";
import Sidebar from "../layout/Side_Bar";

function Dashboard_page() {
    const [selectedDepartment, setSelectedDepartment] = useState("GK사업소");

    return (
        <div>
            <Header />
            {/* 부서 선택 변경 함수 전달 */}
            <Sidebar onSelectDepartment={setSelectedDepartment} selectedDepartment={selectedDepartment} />
            {/* 선택된 부서 전달 */}
            <Statistics_sub department={selectedDepartment} />
            <Footer />
        </div>
    );
}

export default Dashboard_page;
