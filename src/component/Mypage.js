import React, { useState } from "react";
import User_info from "./User_info";

const Mypage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

          </ul>
        </nav>

        {/* 콘텐츠 영역 */}
        <main className="w-3/4 bg-white shadow rounded p-6 ml-6">
          <section id="profile" className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">프로필 정보</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
              >
                비밀번호 변경
              </button>
            </div>
            <User_info setUser={setUserInfo} />
            {userInfo && (
              <div className="mt-4 space-y-2">
                <p className="text-gray-700">이름: {userInfo.name}</p>
                <p className="text-gray-700">사업소: {userInfo.business_location}</p>
                <p className="text-gray-700">부서: {userInfo.department}</p>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* 비밀번호 변경 모달 */}
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userInfo={userInfo}
      />
    </div>
  );
};

const ChangePasswordModal = ({ isOpen, onClose, userInfo }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 4) {
      alert("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          username: userInfo?.id, // User_info에서 id를 가져온다고 가정
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        onClose();
        // 폼 초기화
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.message || "비밀번호 변경 실패");
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-xl font-bold text-gray-700 text-center mb-6">비밀번호 변경</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              현재 비밀번호
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="현재 비밀번호 입력"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="새 비밀번호 입력"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="새 비밀번호 다시 입력"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400"
            >
              취소
            </button>
            <button
              type="submit"
              className="w-1/2 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600"
            >
              변경하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Mypage;
