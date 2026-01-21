import React, { useState } from "react";
import Product_list from "../component/Product_list";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Sidebar from "../layout/Side_Bar";

function Mat_list_page() {

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1 ml-60 p-4">
                    <Product_list />
                </div>
            </div>
            <Footer />
        </div>
    );
}


export default Mat_list_page;
