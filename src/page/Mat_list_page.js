import React, { useState } from "react";
import Product_list from "../component/Product_list";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

function Mat_list_page() {

    return (
        <div>
            <Header />
            <Product_list />
            <Footer />
        </div>
    );
}


export default Mat_list_page;
