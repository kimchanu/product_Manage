import React from "react";
import InputStatistics from "../component/InputStatistics";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Sidebar from "../layout/Side_Bar";

function Input_Statistics() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1 ml-60 p-4">
                    <InputStatistics />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Input_Statistics; 