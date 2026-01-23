import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import User_info from "../component/User_info";
import mainLogo from "../image/main_logo.png";

function Nav({ user }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [clickedCategory, setClickedCategory] = useState(null);
  let timer;

  // 카테고리 목록을 user.admin 값에 따라 동적으로 생성
  const baseCategories = [
    { name: "자재관리", subCategories: [] },
    { name: "빈페이지", subCategories: [] },
    { name: "빈페이지", subCategories: [] },
  ];
  const adminCategory = { name: "관리자", subCategories: ["예산", "수동 입력", "출고 승인"] };
  const categories =
    user && Number(user.admin) >= 1
      ? [...baseCategories, adminCategory]
      : baseCategories;

  return (
    <nav style={{ paddingTop: "2rem" }}>
      {/* 이 div는 전체 내비게이션 바의 컨테이너입니다. */}
      <div className="w-full px-4 flex items-center justify-center relative">
        <div className="absolute left-10">
          <Link to="/">
            <img
              src={mainLogo}
              alt="Main Logo"
              className="h-20 w-20 relative -top-[18px] translate-x-[30px]"
            />
          </Link>
        </div>
        {/* 카테고리들을 감싸는 이 div에 margin-bottom을 추가합니다. */}
        <div className="flex w-3/4 border-y border-gray-300 mb-3 text-center">
          {categories.map((category, idx) => (
            <div
              key={idx}
              className="flex-1 text-xl text-gray-700 hover:text-blue-400 py-2 font-bold cursor-pointer relative tracking-widest border-r border-gray-300 last:border-r-0"
              onMouseEnter={() => setHoveredCategory(category.name)}
              onMouseLeave={() => {
                timer = setTimeout(() => setHoveredCategory(null), 1000);
                return () => clearTimeout(timer);
              }}
              onClick={() =>
                setClickedCategory(clickedCategory === category.name ? null : category.name)
              }
            >
              {category.name === "자재관리" ? (
                <Link to="/" className="font-bold">{category.name}</Link>
              ) : category.name === null ? (
                <Link to="#" className="font-bold">{category.name}</Link>
              ) : (
                <span className="font-bold">{category.name}</span>
              )}

              {(hoveredCategory === category.name || clickedCategory === category.name) &&
                category.subCategories.length > 0 && (
                  <div
                    className="absolute top-full mt-2 left-0 bg-white shadow-md border rounded-lg w-48 z-30"
                    onMouseEnter={() => clearTimeout(timer)}
                    onMouseLeave={() => {
                      timer = setTimeout(() => setHoveredCategory(null), 1000);
                      return () => clearTimeout(timer);
                    }}>
                    {category.subCategories.map((sub, subIdx) => (
                      <Link
                        key={subIdx}
                        to={
                          sub === "입고 등록"
                            ? "/upload"
                            : sub === "수동 입력"
                              ? "/Input_manual_page"
                              : sub === "입고 현황"
                                ? "/input_mod"
                                : sub === "입고 통계"
                                  ? "/input_statistics"
                                  : sub === "출고 등록"
                                    ? "/Mat_output_page"
                                    : sub === "출고 현황"
                                      ? "/Output_Mod"
                                      : sub === "예산"
                                        ? "/Budget"
                                        : sub === "출고 통계"
                                          ? "/Output_Statistics_page"
                                          : sub === "출고 승인"
                                            ? "/Output_Approve_page"
                                            : "#"
                        }
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-blue-100 hover:text-blue-600 cursor-pointer font-bold tracking-widest"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/login_page");
  };

  return (
    <header>
      <User_info setUser={setUser} />
      <div style={{ display: "flex", alignItems: "center", width: "100%", padding: "1rem 2rem 0rem" }}>

        <div style={{ display: "flex", alignItems: "center", flexShrink: 0, minWidth: 'fit-content', marginLeft: 'auto' }}>
          {user ? (
            <>
              <span className="text-sm text-gray-600 flex-shrink-0" style={{ marginRight: "1rem" }}>{user.business_location} {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 transition whitespace-nowrap"
                style={{ marginRight: "1rem" }}
              >
                로그아웃
              </button>
              <Link
                to="/mypage"
                className="text-sm text-blue-600 hover:text-blue-800 transition whitespace-nowrap"
              >
                마이페이지
              </Link>
            </>
          ) : (
            <Link
              to="/Login_page"
              className="text-sm text-blue-600 hover:text-blue-800 transition whitespace-nowrap"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
      <Nav user={user} />
    </header>
  );
}

export default Header;