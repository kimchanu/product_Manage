import React, { useState } from "react";
import User_info from "./User_info";

const Mypage = () => {
  const [userInfo, setUserInfo] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* 메인 레이아웃 */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex">
        {/* 사이드바 */}
        <nav className="w-1/4 bg-white shadow rounded p-4">
          <ul className="space-y-4">
            <li>
              <a
                href="#profile"
                className="block px-4 py-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
              >
                프로필 정보
              </a>
            </li>
            <li>
              <a
                href="#settings"
                className="block px-4 py-2 rounded text-gray-700 hover:bg-gray-200"
              >
                계정 설정
              </a>
            </li>
          </ul>
        </nav>

        {/* 콘텐츠 영역 */}
        <main className="w-3/4 bg-white shadow rounded p-6 ml-6">
          <section id="profile" className="mb-6">
            <h2 className="text-xl font-bold mb-4">프로필 정보</h2>
            <User_info setUser={setUserInfo} />
            {userInfo && (
              <div className="mt-4 space-y-2">
                <p className="text-gray-700">이름: {userInfo.name}</p>
                <p className="text-gray-700">사업소: {userInfo.business_location}</p>
                <p className="text-gray-700">부서: {userInfo.department}</p>
              </div>
            )}
          </section>
          <section id="settings" className="mb-6">
            <h2 className="text-xl font-bold mb-4">계정 설정</h2>
            <p className="text-gray-700">비밀번호 변경</p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Mypage;
