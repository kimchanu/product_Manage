import React, { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Sidebar from "../layout/Side_Bar";
import StatementApprovalCenter from "../component/Approval/StatementApprovalCenter";

function Statement_Approval_page() {
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const convertLocationToCode = (locationName) => {
    if (!locationName) return null;
    if (locationName === "GK사업소") {
      return "GK";
    }
    return locationName;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar
          onSelectDepartment={setSelectedDepartment}
          selectedDepartment={selectedDepartment}
        />
        <main className="flex-1 p-4">
          <StatementApprovalCenter
            selectedBusinessLocation={convertLocationToCode(selectedDepartment)}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Statement_Approval_page;
