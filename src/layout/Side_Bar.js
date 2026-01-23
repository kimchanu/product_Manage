import React, { useState } from "react";
import { Link } from "react-router-dom";

function Sidebar({ onSelectDepartment, selectedDepartment }) {
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
        "천마사업소": "CM사업소",
        "을숙도사업소": "ES사업소",
        "강남사업소": "GN사업소"
    };

    const departments = Object.keys(departmentMap);

    return (
        <aside className="w-60 bg-gray-100 h-[calc(100vh-130px)] fixed top-[130px] left-0 p-4 shadow-md flex flex-col pb-6">
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
                                <li><Link to="/upload" className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded">입고 등록</Link></li>
                                <li><Link to="/input_mod" className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded">입고 현황</Link></li>
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
                                <li><Link to="/Mat_output_page" className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded">출고 등록</Link></li>
                                <li><Link to="/Output_Mod" className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded">출고 현황</Link></li>
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
                    <span>부서</span>
                    <span className="text-sm">{expandedMenus.dept ? "▲" : "▼"}</span>
                </div>

                {/* Dropdown List - Expands Below, Pushing Header Up due to flex layout */}
                {expandedMenus.dept && (
                    <ul className="mt-1 space-y-1 bg-white border border-gray-200 rounded shadow-sm py-1">
                        {departments.map((displayName) => (
                            <li
                                key={displayName}
                                onClick={() => {
                                    onSelectDepartment && onSelectDepartment(departmentMap[displayName]);
                                    toggleMenu('dept'); // Close menu after selection
                                }}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${selectedDepartment === departmentMap[displayName] ? "bg-blue-100 font-bold text-blue-700" : "text-gray-700"
                                    }`}
                            >
                                {displayName}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
