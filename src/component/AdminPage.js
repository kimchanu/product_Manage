import React from "react";

const AdminPage = () => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* 사이드바 */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 text-lg font-bold text-gray-800">
          관리자 페이지
        </div>
        <nav className="mt-4">
          <ul className="space-y-2">
            <li>
              <a
                href="#dashboard"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-blue-100 hover:text-blue-600"
              >
                대시보드
              </a>
            </li>
            <li>
              <a
                href="#user-management"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-blue-100 hover:text-blue-600"
              >
                사용자 관리
              </a>
            </li>
            <li>
              <a
                href="#orders"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-blue-100 hover:text-blue-600"
              >
                주문 관리
              </a>
            </li>
            <li>
              <a
                href="#settings"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-blue-100 hover:text-blue-600"
              >
                설정
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 p-6">
        <section id="dashboard" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">대시보드</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white shadow rounded p-4">
              <h3 className="text-lg font-semibold">사용자 수</h3>
              <p className="text-2xl font-bold text-blue-500">120</p>
            </div>
            <div className="bg-white shadow rounded p-4">
              <h3 className="text-lg font-semibold">총 주문</h3>
              <p className="text-2xl font-bold text-blue-500">340</p>
            </div>
            <div className="bg-white shadow rounded p-4">
              <h3 className="text-lg font-semibold">매출</h3>
              <p className="text-2xl font-bold text-blue-500">₩2,400,000</p>
            </div>
          </div>
        </section>

        <section id="user-management" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">사용자 관리</h2>
          <table className="w-full bg-white shadow rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">이름</th>
                <th className="p-4 text-left">이메일</th>
                <th className="p-4 text-left">역할</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-4">1</td>
                <td className="p-4">홍길동</td>
                <td className="p-4">hong@example.com</td>
                <td className="p-4">관리자</td>
              </tr>
              <tr className="border-t">
                <td className="p-4">2</td>
                <td className="p-4">김영희</td>
                <td className="p-4">kim@example.com</td>
                <td className="p-4">사용자</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section id="orders">
          <h2 className="text-2xl font-bold mb-4">주문 관리</h2>
          <p className="text-gray-700">주문 관리 기능은 현재 개발 중입니다.</p>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
