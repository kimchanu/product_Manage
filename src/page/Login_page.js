import React, { useState } from "react";
import Login from "../component/Login";
import { Link } from "react-router-dom";
import Footer from "../layout/Footer";

function Login_page() {

  return (
    <div>
        <Login />
        <Footer />
    </div>
);
}


export default Login_page;
