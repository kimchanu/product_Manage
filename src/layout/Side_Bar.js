import React, { useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Side_Bar.css";

function Sidebar({
  onSelectDepartment,
  selectedDepartment,
  onSelectDept,
  selectedDept,
  open = true,
  onToggle,
}) {
  const [expandedMenus, setExpandedMenus] = useState({
    input: false,
    output: false,
    dept: false,
  });

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const departmentMap = {
    "\u0047\u004B\uC0AC\uC5C5\uC18C": "\u0047\u004B\uC0AC\uC5C5\uC18C",
    "\uCC9C\uB9C8\uC0AC\uC5C5\uC18C": "\uCC9C\uB9C8\uC0AC\uC5C5\uC18C",
    "\uC2E0\uC218\uC0AC\uC5C5\uC18C": "\uC2E0\uC218\uC0AC\uC5C5\uC18C",
    "\uAC15\uB0A8\uC0AC\uC5C5\uC18C": "\uAC15\uB0A8\uC0AC\uC5C5\uC18C",
    "\uC11C\uC6D0\uC0AC\uC5C5\uC18C": "\uC11C\uC6D0\uC0AC\uC5C5\uC18C",
  };

  const departments = Object.keys(departmentMap);
  const deptList = ["ITS", "\uAE30\uC804", "\uC2DC\uC124"];

  let isRestricted = false;
  const token = localStorage.getItem("authToken");

  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (
        decoded.business_location === "\uBCF8\uC0AC" ||
        decoded.department === "\uAD00\uB9AC"
      ) {
        isRestricted = true;
      }
    } catch (error) {
      console.error("Token decoding error:", error);
    }
  }

  return (
    <div className="sidebar-root relative">
      <aside className="sidebar-panel w-60 p-4 flex flex-col pb-6 sticky top-[130px] h-[calc(100vh-130px)] overflow-auto">
        <div className="sidebar-scroll flex-1 overflow-auto no-scrollbar">
          <div className="sidebar-menu-title mb-6 font-semibold text-lg border-b pb-2">
            {"\uBA54\uB274"}
          </div>

          <ul className="sidebar-menu-list space-y-2 mb-8">
            <li>
              <Link
                to="/PostList_page"
                className="block px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
              >
                {"\uAC8C\uC2DC\uD310"}
              </Link>
            </li>

            <li>
              <div
                className="px-2 py-1 rounded cursor-pointer hover:bg-gray-200 flex justify-between items-center"
                onClick={() => toggleMenu("input")}
              >
                <span>{"\uC785\uACE0\uAD00\uB9AC"}</span>
                <span className="text-sm">{expandedMenus.input ? "\u25B2" : "\u25BC"}</span>
              </div>

              {expandedMenus.input && (
                <ul className="pl-4 mt-1 space-y-1 text-sm bg-gray-50 rounded py-2">
                  {!isRestricted && (
                    <>
                      <li>
                        <Link
                          to="/upload"
                          className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          {"\uC785\uACE0 \uB4F1\uB85D"}
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/input_mod"
                          className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          {"\uC785\uACE0 \uD604\uD669"}
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <Link
                      to="/input_statistics"
                      className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      {"\uC785\uACE0 \uD1B5\uACC4"}
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link
                to="/Mat_list_page"
                className="block px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
              >
                {"\uC790\uC7AC\uBAA9\uB85D"}
              </Link>
            </li>

            <li>
              <div
                className="px-2 py-1 rounded cursor-pointer hover:bg-gray-200 flex justify-between items-center"
                onClick={() => toggleMenu("output")}
              >
                <span>{"\uCD9C\uACE0\uAD00\uB9AC"}</span>
                <span className="text-sm">{expandedMenus.output ? "\u25B2" : "\u25BC"}</span>
              </div>

              {expandedMenus.output && (
                <ul className="pl-4 mt-1 space-y-1 text-sm bg-gray-50 rounded py-2">
                  {!isRestricted && (
                    <>
                      <li>
                        <Link
                          to="/Mat_output_page"
                          className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          {"\uCD9C\uACE0 \uB4F1\uB85D"}
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/Output_Mod"
                          className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          {"\uCD9C\uACE0 \uD604\uD669"}
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <Link
                      to="/Output_Statistics_page"
                      className="block px-2 py-1 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      {"\uCD9C\uACE0 \uD1B5\uACC4"}
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link
                to="/Statement_page"
                className="block px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
              >
                {"\uC790\uC7AC\uC218\uBD88\uBA85\uC138\uC11C"}
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-auto pt-2 border-t border-gray-300 mb-8">
          <div
            className="px-2 py-2 rounded cursor-pointer hover:bg-gray-200 flex justify-between items-center font-semibold text-lg text-gray-700"
            onClick={() => toggleMenu("dept")}
          >
            <span>{"\uC0AC\uC5C5\uC18C"}</span>
            <span className="text-sm">{expandedMenus.dept ? "\u25B2" : "\u25BC"}</span>
          </div>

          {expandedMenus.dept && (
            <div className="mt-1 space-y-1">
              <ul className="bg-white border border-gray-200 rounded shadow-sm py-1">
                {departments.map((displayName) => (
                  <li
                    key={displayName}
                    onClick={() => {
                      const location = departmentMap[displayName];
                      onSelectDepartment && onSelectDepartment(location);
                      if (onSelectDept) onSelectDept(null);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                      selectedDepartment === departmentMap[displayName]
                        ? "bg-blue-100 font-bold text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {displayName}
                  </li>
                ))}
              </ul>

              {selectedDepartment ? (
                <div className="mt-2">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-600 mb-1">
                    {"\uBD80\uC11C"}
                  </div>
                  <ul className="bg-white border border-gray-200 rounded shadow-sm py-1">
                    {deptList.map((dept) => (
                      <li
                        key={dept}
                        onClick={() => {
                          onSelectDept && onSelectDept(dept);
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                          selectedDept === dept
                            ? "bg-blue-100 font-bold text-blue-700"
                            : "text-gray-700"
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

    </div>
  );
}

export default Sidebar;
