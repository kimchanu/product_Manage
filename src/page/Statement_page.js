import React, { useState } from "react";
import Statement from "../component/Statement";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Sidebar from "../layout/Side_Bar";

function Statement_page() {
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    // 사업소 이름을 코드로 변환하는 함수
    const convertLocationToCode = (locationName) => {
        if (!locationName) return null;
        // "GK사업소" -> "GK"로 변환
        if (locationName === "GK사업소") {
            return "GK";
        }
        // 다른 사업소는 그대로 반환
        return locationName;
    };

    const handleDepartmentSelect = (department) => {
        setSelectedDepartment(department);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar 
                    onSelectDepartment={handleDepartmentSelect}
                    selectedDepartment={selectedDepartment}
                />
                <div className="flex-1 ml-60 p-4">
                    <Statement selectedBusinessLocation={convertLocationToCode(selectedDepartment)} />
                </div>
            </div>
            <Footer />
        </div>
    );
}


export default Statement_page;
