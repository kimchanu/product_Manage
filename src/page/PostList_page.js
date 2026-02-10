import React, { useState } from "react";
import PostList from "../component/Post/PostList";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Sidebar from "../layout/Side_Bar";

function PostList_page() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1 bg-gray-50">
        {sidebarOpen && (
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 relative">
          {/* 닫혔을 때 열기 버튼(왼쪽 중앙) */}
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="fixed top-1/2 left-0 -translate-y-1/2 w-6 h-12 bg-gray-200 border border-gray-300 rounded-r-md flex items-center justify-center hover:bg-gray-300 shadow z-40"
              aria-label="사이드바 열기"
            >
              <span className="text-sm font-bold">▶</span>
            </button>
          )}

          <PostList />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default PostList_page;