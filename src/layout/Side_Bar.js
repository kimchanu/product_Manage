import React, { useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import mainLogo from "../image/main_logo.png";

function Sidebar({ onSelectDepartment, selectedDepartment, onSelectDept, selectedDept,open = true,onToggle, }) {
    const [expandedMenus, setExpandedMenus] = useState({
        input: false,
        output: false,
        dept: false // Add state for department dropdown
    });

    const toggleMenu = (menu) => {
        setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const departmentMap = {
        "GK사업소": "GK사업소",
        "천마사업소": "천마사업소",
        "을숙도사업소": "을숙도사업소",
        "강남사업소": "강남사업소",
        "수원사업소": "수원사업소"
    };

    const departments = Object.keys(departmentMap);
    
    // 부서 목록
    const deptList = ["ITS", "기전", "시설"];

    // 토큰에서 사용자 정보 가져오기 및 권한 확인
    let isRestricted = false;
    const token = localStorage.getItem("authToken");

    if (token) {
        try {
            const decoded = jwtDecode(token);
            // 사업소가 "본사"이거나 부서가 "관리"인 경우 제한
            if (decoded.business_location === "본사" || decoded.department === "관리") {
                isRestricted = true;
            }
        } catch (error) {
            console.error("Token decoding error:", error);
        }
    }

    return (
        <div className="relative">
<aside className="w-60 bg-gray-100 p-4 shadow-md flex flex-col pb-6 sticky top-[130px] h-[calc(100vh-130px)] overflow-auto">
            <Link to="/" className="fixed left-10 top-4 z-[60]">
  <img
    src={mainLogo}
    alt="Main Logo"
    className="h-20 w-41 relative -top-[-10px] translate-x-[-45px]"
  />
</Link>
            {/* 메뉴 네비게이션 섹션 */}
            <div className="flex-1 overflow-auto bg-gray-100 no-scrollbar">
                <div className="mb-6 font-semibold text-lg border-b border-gray-300 pb-2">
                    메뉴
                </div>
                <ul className="space-y-2 text-gray-700 mb-8">
                    {/* 게시판 */}
                    <li>
                        <Link
                            to="/PostList_page"
                            className="block px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                        >
                            게시판
                        </Link>
                    </li>

                    {/* 입고관리 */}
                    <li>
                        <div
                            className="px-2 py-1 rounded cursor-pointer hover:bg-gray-200 flex justify-between items-center"
                            onClick={() => toggleMenu('input')}
                        >
                            <span>입고관리</span>
                            <span className="text-sm">{expandedMenus.input ? "▲" : "▼"}</span>
                        </div>
                        {expandedMenus.input && (
                            <ul className="pl-4 mt-1 space-y-1 text-sm bg-gray-50 rounded py-2">
                                {!isRestricted && (
                                    <>
                                        <li><Link to="/upload" className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded">입고 등록</Link></li>
                                        <li><Link to="/input_mod" className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded">입고 현황</Link></li>
                                    </>
                                )}
                                <li><Link to="/input_statistics" className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded">입고 통계</Link></li>
                            </ul>
                        )}
                    </li>

                    {/* 자재목록 */}
                    <li>
                        <Link
                            to="/Mat_list_page"
                            className="block px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                        >
                            자재목록
                        </Link>
                    </li>

                    {/* 출고관리 */}
                    <li>
                        <div
                            className="px-2 py-1 rounded cursor-pointer hover:bg-gray-200 flex justify-between items-center"
                            onClick={() => toggleMenu('output')}
                        >
                            <span>출고관리</span>
                            <span className="text-sm">{expandedMenus.output ? "▲" : "▼"}</span>
                        </div>
                        {expandedMenus.output && (
                            <ul className="pl-4 mt-1 space-y-1 text-sm bg-gray-50 rounded py-2">
                                {!isRestricted && (
                                    <>
                                        <li><Link to="/Mat_output_page" className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded">출고 등록</Link></li>
                                        <li><Link to="/Output_Mod" className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded">출고 현황</Link></li>
                                    </>
                                )}
                                <li><Link to="/Output_Statistics_page" className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded">출고 통계</Link></li>
                            </ul>
                        )}
                    </li>

                    {/* 자재수불명세서대장 */}
                    <li>
                        <Link
                            to="/Statement_page"
                            className="block px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                        >
                            자재수불명세서대장
                        </Link>
                    </li>
                </ul>
            </div>

            {/* 부서 선택 섹션 (Bottom Accordion) */}
            <div className="mt-auto pt-2 border-t border-gray-300 mb-8">
                <div
                    className="px-2 py-2 rounded cursor-pointer hover:bg-gray-200 flex justify-between items-center font-semibold text-lg text-gray-700"
                    onClick={() => toggleMenu('dept')}
                >
                    <span>사업소</span>
                    <span className="text-sm">{expandedMenus.dept ? "▲" : "▼"}</span>
                </div>

                {/* Dropdown List - Expands Below, Pushing Header Up due to flex layout */}
                {expandedMenus.dept && (
                    <div className="mt-1 space-y-1">
                        {/* 사업소 목록 */}
                        <ul className="bg-white border border-gray-200 rounded shadow-sm py-1">
                            {departments.map((displayName) => (
                                <li
                                    key={displayName}
                                    onClick={() => {
                                        const location = departmentMap[displayName];
                                        onSelectDepartment && onSelectDepartment(location);
                                        // 부서 선택 초기화
                                        if (onSelectDept) {
                                            onSelectDept(null);
                                        }
                                    }}
                                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${selectedDepartment === departmentMap[displayName] ? "bg-blue-100 font-bold text-blue-700" : "text-gray-700"
                                        }`}
                                >
                                    {displayName}
                                </li>
                            ))}
                        </ul>
                        
                        {/* 선택된 사업소가 있을 때 부서 목록 표시 */}
                        {selectedDepartment ? (
                            <div className="mt-2">
                                <div className="px-2 py-1 text-xs font-semibold text-gray-600 mb-1">
                                    부서
                                </div>
                                <ul className="bg-white border border-gray-200 rounded shadow-sm py-1">
                                    {deptList.map((dept) => (
                                        <li
                                            key={dept}
                                            onClick={() => {
                                                onSelectDept && onSelectDept(dept);
                                            }}
                                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${selectedDept === dept ? "bg-blue-100 font-bold text-blue-700" : "text-gray-700"
                                                }`}
                                        >
                                            {dept}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </aside>
        {/* ✅ 사이드바 오른쪽 '중앙' 토글 버튼 */}
      <button
      type="button"
      onClick={onToggle}
      className="
        absolute top-1/2 -right-3 -translate-y-1/2
        w-6 h-12
        bg-gray-200 border border-gray-300
        rounded-r-md
        flex items-center justify-center
        hover:bg-gray-300
        shadow
      "
      aria-label={open ? "사이드바 숨기기" : "사이드바 열기"}
    >
      <span className="text-sm font-bold">
        {open ? "◀" : "▶"}
      </span>
    </button>
  </div>
    );
}

export default Sidebar;
