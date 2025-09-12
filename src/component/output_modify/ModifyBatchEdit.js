import React from "react";

const ModifyBatchEdit = ({ batchEditMode, handleBatchEdit }) => {
    if (!batchEditMode) return null;

    return (
        <div className="p-4 bg-gray-50 border-t">
            <button
                onClick={handleBatchEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
                선택한 항목 일괄 수정
            </button>
        </div>
    );
};

export default ModifyBatchEdit; 