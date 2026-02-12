import React, { useState } from "react";
import Output_Modify from "../component/Output_Modify";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Sidebar from "../layout/Side_Bar";

function Output_Mod() {

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1 p-4">
                    <Output_Modify />
                </div>
            </div>
            <Footer />
        </div>
    );
}


export default Output_Mod;
