import React from "react";
import { FaFilter } from "react-icons/fa";

const InputModifyTable = ({
    filteredMaterials,
    allMaterialsForFilter,
    selectedRows,
    handleSelectAll,
    handleRowSelect,
    editRowIndex,
    editedRow,
    handleEditClick,
    handleInputChange,
    handleSaveClick,
    handleDeleteClick,
    batchEditMode,
    batchEditValue,
    setBatchEditValue,
    handleHeaderClick,
    handleBatchEdit,
    setEditRowIndex,
    setEditedRow,
    showMaterialCodeFilter,
    setShowMaterialCodeFilter,
    setMaterialCodeFilter,
    allChecked,
    isIndeterminate,
    handleScroll,
}) => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            <div className="max-h-[760px] overflow-y-auto" onScroll={handleScroll}>
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2 text-center text-sm w-10">
                                <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    checked={allChecked}
                                    ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-2 text-left text-sm w-23">
                                <div className="flex items-center relative">
                                    자재코드
                                    <button
                                        onClick={() => setShowMaterialCodeFilter(v => !v)}
                                        className="ml-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <FaFilter size={12} />
                                    </button>
                                    {showMaterialCodeFilter && (
                                        <div className="absolute top-full mt-1 w-48 bg-white shadow-lg rounded-md z-20 border border-gray-200">
                                            <div className="p-2 max-h-60 overflow-y-auto">
                                                {Array.from(new Set(allMaterialsForFilter.map(item => item.material_code))).map((value, i) => (
                                                    <div
                                                        key={i}
                                                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                                                        onClick={() => {
                                                            setMaterialCodeFilter(value);
                                                            setShowMaterialCodeFilter(false);
                                                        }}
                                                    >
                                                        {value || "-"}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="border-t border-gray-200 p-1 text-center">
                                                <button
                                                    className="text-xs text-blue-500 hover:text-blue-700"
                                                    onClick={() => {
                                                        setMaterialCodeFilter("");
                                                        setShowMaterialCodeFilter(false);
                                                    }}
                                                >
                                                    필터 초기화
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </th>
                            <th className="px-4 py-2 text-left text-sm">위치</th>
                            <th className="px-4 py-2 text-left text-sm">대분류</th>
                            <th className="px-4 py-2 text-left text-sm">중분류</th>
                            <th className="px-4 py-2 text-left text-sm">소분류</th>
                            <th className="px-4 py-2 text-left text-sm">품명</th>
                            <th className="px-4 py-2 text-left text-sm w-32">규격</th>
                            <th className="px-4 py-2 text-left text-sm">제조사</th>
                            <th className="px-4 py-2 text-left text-sm">단위</th>
                            <th className="px-4 py-2 text-right text-sm">단가</th>
                            <th className="px-4 py-2 text-right text-sm w-16">입고 수량</th>
                            <th className="px-4 py-2 text-right text-sm">입고 금액</th>
                            <th
                                className={`px-4 py-2 text-left text-sm cursor-pointer ${batchEditMode === 'date' ? 'bg-blue-100' : ''}`}
                                onClick={() => handleHeaderClick('date')}
                            >
                                입고일
                                {batchEditMode === 'date' && (
                                    <div className="mt-2">
                                        <input
                                            type="date"
                                            value={batchEditValue}
                                            onChange={(e) => setBatchEditValue(e.target.value)}
                                            className="border rounded px-1 py-0.5 text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                )}
                            </th>
                            <th
                                className={`px-4 py-2 text-left text-sm w-20 cursor-pointer ${batchEditMode === 'user' ? 'bg-blue-100' : ''}`}
                                onClick={() => handleHeaderClick('user')}
                            >
                                담당자
                                {batchEditMode === 'user' && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={batchEditValue}
                                            onChange={(e) => setBatchEditValue(e.target.value)}
                                            maxLength={3}
                                            className="border rounded px-1 py-0.5 text-sm w-16"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                )}
                            </th>
                            <th className="px-4 py-2 text-center text-sm w-20">수정</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredMaterials.length > 0 ? (
                            filteredMaterials.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            checked={selectedRows.has(idx)}
                                            onChange={() => handleRowSelect(idx)}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-sm w-24">{item.material_code}</td>
                                    <td className="px-4 py-2 text-sm">{item.location || "-"}</td>
                                    <td className="px-4 py-2 text-sm">{item.big_category || "-"}</td>
                                    <td className="px-4 py-2 text-sm">{item.category || "-"}</td>
                                    <td className="px-4 py-2 text-sm">{item.sub_category || "-"}</td>
                                    <td className="px-4 py-2 text-sm">{item.name}</td>
                                    <td className="px-4 py-2 text-sm w-32">{item.specification || "-"}</td>
                                    <td className="px-4 py-2 text-sm">{item.manufacturer || "-"}</td>
                                    <td className="px-4 py-2 text-sm">{item.unit || "-"}</td>
                                    <td className="px-4 py-2 text-sm text-right">
                                        {item.price?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-right w-16">
                                        {item.input_quantity?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-right">
                                        {(Number(item.input_quantity) * Number(item.price))?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-left">
                                        {editRowIndex === idx ? (
                                            <input
                                                type="date"
                                                name="input_date"
                                                value={editedRow.input_date || ""}
                                                onChange={handleInputChange}
                                                className="border rounded px-1 py-0.5 text-sm leading-tight w-28"
                                            />
                                        ) : (
                                            item.input_date ? item.input_date.slice(0, 10) : "-"
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-left w-20">
                                        {editRowIndex === idx ? (
                                            <input
                                                type="text"
                                                name="input_user"
                                                maxLength={3}
                                                value={editedRow.input_user || ""}
                                                onChange={handleInputChange}
                                                className="border rounded px-1 py-0.5 text-sm leading-tight w-16"
                                            />
                                        ) : (
                                            item.input_user || "-"
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-center w-28">
                                        {editRowIndex === idx ? (
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSaveClick(idx); }}
                                                    className="bg-transparent text-black px-2 py-0.5 rounded min-w-[50px] text-sm hover:bg-gray-200 transition"
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditRowIndex(null); setEditedRow({}); }}
                                                    className="bg-transparent text-black px-2 py-0.5 rounded min-w-[50px] text-sm hover:bg-gray-200 transition"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEditClick(idx); }}
                                                className="bg-transparent text-black px-2 py-0.5 rounded text-sm hover:bg-gray-200 transition"
                                            >
                                                수정
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="17" className="text-center p-4 text-gray-500">
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        {batchEditMode && (
            <div className="p-4 bg-gray-50 border-t">
                <button
                    onClick={handleBatchEdit}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                    선택한 항목 일괄 수정
                </button>
            </div>
        )}
    </div>
);

export default InputModifyTable;
