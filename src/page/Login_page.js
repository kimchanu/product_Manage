import React, { useState } from "react";
import Login from "../component/Login";
import { Link } from "react-router-dom";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

function Login_page() {

  return (
    <div>
        <Header />
        <Login />
        <Footer />
    </div>
);
}


export default Login_page;
