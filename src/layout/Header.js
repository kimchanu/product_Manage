import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Image from "../image/koinfra.png";
import User_info from "../component/User_info";

function Nav() {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [clickedCategory, setClickedCategory] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  let timer;

  // 카테고리 목록을 user.admin 값에 따라 동적으로 생성
  const baseCategories = [
    { name: "게시판", subCategories: [] },
    { name: "입고관리", subCategories: ["입고 등록", "입고 현황", "입고 통계"] },
    { name: "자재목록", subCategories: [] },
    { name: "출고관리", subCategories: ["출고 등록", "출고 현황", "출고 통계"] },
    { name: "자재수불명세서대장", subCategories: [] },
  ];
  const adminCategory = { name: "관리자", subCategories: ["예산", "출고 승인"] };
  const categories =
    user && Number(user.admin) >= 1
      ? [...baseCategories, adminCategory]
      : baseCategories;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/login_page");
  };

  return (
    <nav>
      <User_info setUser={setUser} />
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link to="/">
          <img src={Image} alt="koinfra" />
        </Link>

        {/* 카테고리 */}
        <div className="flex justify-around relative w-full ml-4 items-center">
          {categories.map((category, idx) => (
            <div
              key={idx}
              className="text-sm text-gray-700 hover:text-blue-400 px-2 py-1 rounded-md font-medium cursor-pointer relative"
              onMouseEnter={() => setHoveredCategory(category.name)}
              onMouseLeave={() => {
                timer = setTimeout(() => setHoveredCategory(null), 1000);
                return () => clearTimeout(timer);
              }}
              onClick={() =>
                setClickedCategory(clickedCategory === category.name ? null : category.name)
              }
            >
              {category.name === "자재수불명세서대장" ? (
                <Link to="/Statement_page">{category.name}</Link>
              ) : category.name === "게시판" ? (
                <Link to="/PostList_page">{category.name}</Link>
              ) : category.name === "자재목록" ? (
                <Link to="/Mat_list_page">{category.name}</Link>
              ) : (
                category.name
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
                        className="block px-4 py-2 text-gray-800 hover:bg-blue-100 hover:text-blue-600 cursor-pointer"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* 로그인 메뉴 */}
        <div className="ml-5 flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600 flex-shrink-0">{user.business_location} {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 transition whitespace-nowrap"
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
    </nav>
  );
}

function Header() {
  return (
    <header>
      <Nav />
    </header>
  );
}

export default Header;