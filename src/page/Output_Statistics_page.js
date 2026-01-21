import React, { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Output_Statistics from "../component/Output_Statistics";
import Sidebar from "../layout/Side_Bar";

function Output_Statistics_page() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1 ml-60 p-4">
                    <Output_Statistics />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Output_Statistics_page;
