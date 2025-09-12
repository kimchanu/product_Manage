import React from "react";

const ModifyRow = ({
    item,
    idx,
    editRowIndex,
    editedRow,
    selectedRows,
    handleRowSelect,
    handleInputChange,
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleSplitOutput,
    setEditRowIndex,
    setEditedRow
}) => {
    return (
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
                {item.price?.toLocaleString()} 원
            </td>
            <td className="px-4 py-2 text-sm text-right">
                {item.output_quantity?.toLocaleString()} 개
            </td>
            <td className="px-4 py-2 text-sm text-left">
                {editRowIndex === idx ? (
                    <input
                        type="date"
                        name="output_date"
                        value={editedRow.output_date || ""}
                        onChange={handleInputChange}
                        className="border rounded px-1 py-0.5 text-sm leading-tight w-28"
                    />
                ) : (
                    item.output_date ? item.output_date.slice(0, 10) : "-"
                )}
            </td>

            <td className="px-4 py-2 text-sm text-left w-20">
                {editRowIndex === idx ? (
                    <input
                        type="text"
                        name="output_user"
                        maxLength={3}
                        value={editedRow.output_user || ""}
                        onChange={handleInputChange}
                        className="border rounded px-1 py-0.5 text-sm leading-tight w-16"
                    />
                ) : (
                    item.output_user || "-"
                )}
            </td>
            <td className="px-4 py-2 text-sm text-left">
                {editRowIndex === idx ? (
                    <input
                        type="text"
                        name="output_comment"
                        value={editedRow.output_comment || ""}
                        onChange={handleInputChange}
                        className="border rounded px-2 py-0.5 text-sm leading-tight w-32"
                    />
                ) : (
                    item.output_comment || "-"
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
            <td className="px-4 py-2 text-center w-28">
                <div className="flex flex-col gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(idx); }}
                        className="bg-transparent text-black px-2 py-0.5 rounded min-w-[50px] text-sm hover:bg-gray-200 transition"
                    >
                        삭제
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleSplitOutput(idx); }}
                        className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded min-w-[50px] text-sm hover:bg-blue-100 transition border border-blue-200"
                    >
                        분할
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ModifyRow; 