import React, { useState } from "react";

const editableFields = [
    { key: "location", label: "위치" },
    { key: "big_category", label: "대분류" },
    { key: "category", label: "중분류" },
    { key: "sub_category", label: "소분류" },
    { key: "manufacturer", label: "제조사" },
    { key: "unit", label: "단위" }
];

function Product_list_edit({ open, onClose, selectedRows, onSave }) {
    const [field, setField] = useState(editableFields[0].key);
    const [value, setValue] = useState("");
    const [error, setError] = useState("");

    if (!open) return null;

    const handleApply = () => {
        if (!field || value === "") {
            setError("수정할 컬럼과 값을 입력하세요.");
            return;
        }
        setError("");
        onSave({ field, value, selectedRows });
        setValue("");
        setField(editableFields[0].key);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
                <h3 className="text-lg font-bold mb-4">선택 행 일괄 수정</h3>
                <div className="mb-3">
                    <label className="block mb-1 font-medium">수정할 컬럼</label>
                    <select
                        className="border px-2 py-1 rounded w-full"
                        value={field}
                        onChange={e => setField(e.target.value)}
                    >
                        {editableFields.map(f => (
                            <option key={f.key} value={f.key}>{f.label}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="block mb-1 font-medium">수정 값</label>
                    <input
                        className="border px-2 py-1 rounded w-full"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder="새 값 입력"
                    />
                </div>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <div className="flex gap-2 justify-end mt-4">
                    <button
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                        onClick={onClose}
                    >
                        취소
                    </button>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handleApply}
                    >
                        적용
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Product_list_edit; 