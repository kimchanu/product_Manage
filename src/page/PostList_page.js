import React, { useState } from "react";
import PostList from "../component/Post/PostList";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

function PostList_page() {

    return (
        <div>
            <Header />
            <PostList />
            <Footer />
        </div>
    );
}


export default PostList_page;
