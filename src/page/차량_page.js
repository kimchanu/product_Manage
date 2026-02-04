import React, { useState } from "react";
import Statement from "../component/Statement";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Sidebar from "../layout/Side_Bar";

function Statement_page() {

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1 ml-60 p-4">
                    <Statement />
                </div>
            </div>
            <Footer />
        </div>
    ); 
}


export default Statement_page;
