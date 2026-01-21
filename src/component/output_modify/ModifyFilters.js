import React from "react";
import ExcelReport from "../Excel/ExcelReport";

const ModifyFilters = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchTerm,
    setSearchTerm,
    filteredMaterials,
    handleViewAll
}) => {
    return (
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
            <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">시작일</label>
                <input
                    type="date"
                    className="px-3 py-2 border rounded-lg"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>

            <span className="text-gray-500">~</span>

            <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">종료일</label>
                <input
                    type="date"
                    className="px-3 py-2 border rounded-lg"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            <input
                type="text"
                placeholder="자재코드, 이름, 대분류 또는 소분류 입력"
                className="flex-grow px-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
                onClick={handleViewAll}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg whitespace-nowrap"
            >
                전부보기
            </button>
            <ExcelReport
                materials={filteredMaterials}
                startDate={startDate}
                endDate={endDate}
            />
        </div>
    );
};

export default ModifyFilters; 