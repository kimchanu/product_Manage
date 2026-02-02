import React, { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Statistics_sub from "../component/Dashboard";
import Sidebar from "../layout/Side_Bar";

function Dashboard_page() {
    const [selectedDepartment, setSelectedDepartment] = useState("GK사업소");

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <div className="flex flex-1 bg-gray-50">
                <Sidebar
                    onSelectDepartment={setSelectedDepartment}
                    selectedDepartment={selectedDepartment}
                />
                <main className="flex-1 p-6 overflow-auto">
                    <Statistics_sub department={selectedDepartment} />
                </main>
            </div>

            <Footer />
        </div>
    );
}

export default Dashboard_page;
