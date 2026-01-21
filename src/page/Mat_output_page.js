import React, { useState } from "react";
import Output_out from "../component/Output_out";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Sidebar from "../layout/Side_Bar";

function Mat_output_page() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1 ml-60 p-4">
                    <Output_out />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Mat_output_page;
