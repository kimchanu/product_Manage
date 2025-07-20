import React, { useState } from "react";
import Statement from "../component/Statement";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

function Statement_page() {

    return (
        <div>
            <Header />
            <Statement />
            <Footer />
        </div>
    );
}


export default Statement_page;
