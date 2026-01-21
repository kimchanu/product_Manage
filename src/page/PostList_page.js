import React, { useState } from "react";
import PostList from "../component/Post/PostList";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Sidebar from "../layout/Side_Bar";

function PostList_page() {

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1 ml-60 p-4">
                    <PostList />
                </div>
            </div>
            <Footer />
        </div>
    );
}


export default PostList_page;
