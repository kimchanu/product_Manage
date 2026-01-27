import { useState } from "react";

function Search_select({ setBusinessLocation, setDepartment, businessLocation, department }) {
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <select
        value={businessLocation}
        onChange={(e) => setBusinessLocation(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">사업소 선택</option>
        <option value="GK">GK사업소</option>
        <option value="CM">천마사업소</option>
        <option value="ES">을숙도사업소</option>
        <option value="강남사업소">강남사업소</option>
        <option value="수원사업소">수원사업소</option>
      </select>

      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">부서 선택</option>
        <option value="ITS">ITS</option>
        <option value="기전">기전</option>
        <option value="시설">시설</option>
      </select>
    </div>
  );
}

export default Search_select;
