import React, { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Output_Statistics from "../component/Output_Statistics";

function Output_Statistics_page() {
    return (
        <div>
            <Header />
            <Output_Statistics />
            <Footer />
        </div>
    );
}

export default Output_Statistics_page;
