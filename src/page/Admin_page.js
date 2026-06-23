import React from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import AdminConsole from "../component/Admin/AdminConsole";

function Admin_page() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
        <AdminConsole />
      </main>
      <Footer />
    </div>
  );
}

export default Admin_page;
