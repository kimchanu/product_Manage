import React from "react";
import InputModify from "../component/InputModify";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Sidebar from "../layout/Side_Bar";

function Input_Mod() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1 p-4">
                    <InputModify />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Input_Mod;
