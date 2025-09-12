import React from "react";

const ModifyTableHeader = ({
    selectedRows,
    filteredMaterials,
    batchEditMode,
    batchEditValue,
    setBatchEditValue,
    handleSelectAll,
    handleHeaderClick
}) => {
    return (
        <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
                <th className="px-4 py-2 text-center text-sm w-10">
                    <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={selectedRows.size === filteredMaterials.length}
                        onChange={handleSelectAll}
                    />
                </th>
                <th className="px-4 py-2 text-left text-sm w-23">
                    자재코드
                </th>
                <th className="px-4 py-2 text-left text-sm">
                    위치
                </th>
                <th className="px-4 py-2 text-left text-sm">
                    대분류
                </th>
                <th className="px-4 py-2 text-left text-sm">
                    중분류
                </th>
                <th className="px-4 py-2 text-left text-sm">
                    소분류
                </th>
                <th className="px-4 py-2 text-left text-sm">
                    품명
                </th>
                <th className="px-4 py-2 text-left text-sm w-32">
                    규격
                </th>
                <th className="px-4 py-2 text-left text-sm">
                    제조사
                </th>
                <th className="px-4 py-2 text-left text-sm">
                    단위
                </th>
                <th className="px-4 py-2 text-right text-sm">
                    단가
                </th>
                <th className="px-4 py-2 text-right text-sm">
                    출고 수량
                </th>
                <th
                    className={`px-4 py-2 text-left text-sm cursor-pointer ${batchEditMode === 'date' ? 'bg-blue-100' : ''}`}
                    onClick={() => handleHeaderClick('date')}
                >
                    출고일
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
                <th
                    className={`px-4 py-2 text-left text-sm cursor-pointer ${batchEditMode === 'comment' ? 'bg-blue-100' : ''}`}
                    onClick={() => handleHeaderClick('comment')}
                >
                    비고
                    {batchEditMode === 'comment' && (
                        <div className="mt-2">
                            <input
                                type="text"
                                value={batchEditValue}
                                onChange={(e) => setBatchEditValue(e.target.value)}
                                className="border rounded px-2 py-0.5 text-sm w-32"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                </th>
                <th className="px-4 py-2 text-center text-sm w-20">수정</th>
                <th className="px-4 py-2 text-center text-sm w-20">삭제</th>
            </tr>
        </thead>
    );
};

export default ModifyTableHeader; 