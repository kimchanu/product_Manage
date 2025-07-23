import React from "react";

function Sidebar({ onSelectDepartment, selectedDepartment }) {
    const departments = ["GK사업소", "천마사업소", "을숙도사업소"];

    return (
        <aside className="w-60 bg-gray-100 h-screen fixed top-[87px] left-0 p-4 overflow-auto shadow-md">
            <div className="mb-6 font-semibold text-lg border-b border-gray-300 pb-2">
                부서
            </div>
            <ul className="space-y-2 text-gray-700">
                {departments.map((dept) => (
                    <li
                        key={dept}
                        onClick={() => onSelectDepartment(dept)}
                        className={`px-2 py-1 rounded cursor-pointer hover:bg-blue-200 ${selectedDepartment === dept ? "bg-blue-300 font-bold" : ""
                            }`}
                    >
                        {dept}
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default Sidebar;
