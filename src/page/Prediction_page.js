import React from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Sidebar from "../layout/Side_Bar";
import PredictionCenter from "../component/PredictionCenter";

function PredictionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <PredictionCenter />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default PredictionPage;
