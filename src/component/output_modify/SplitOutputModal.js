import React, { useState, useEffect } from "react";

const SplitOutputModal = ({ isOpen, onClose, onConfirm, originalQuantity, originalDate }) => {
    const [splits, setSplits] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);

    useEffect(() => {
        if (isOpen) {
            // 기본값으로 2개 행으로 분할 (첫 번째: 1개, 두 번째: 나머지)
            const defaultSplits = [
                {
                    id: 0,
                    quantity: 1,
                    date: originalDate || new Date().toISOString().split('T')[0]
                },
                {
                    id: 1,
                    quantity: Math.max(1, originalQuantity - 1),
                    date: originalDate || new Date().toISOString().split('T')[0]
                }
            ];
            setSplits(defaultSplits);
            setTotalQuantity(originalQuantity);
        }
    }, [isOpen, originalQuantity, originalDate]);

    const addSplit = () => {
        const newId = splits.length > 0 ? Math.max(...splits.map(s => s.id)) + 1 : 0;
        setSplits([...splits, {
            id: newId,
            quantity: 1,
            date: originalDate || new Date().toISOString().split('T')[0]
        }]);
    };

    const removeSplit = (id) => {
        if (splits.length > 1) {
            setSplits(splits.filter(split => split.id !== id));
        }
    };

    const updateSplit = (id, field, value) => {
        setSplits(splits.map(split =>
            split.id === id ? { ...split, [field]: value } : split
        ));
    };

    useEffect(() => {
        const total = splits.reduce((sum, split) => sum + (parseInt(split.quantity) || 0), 0);
        setTotalQuantity(total);
    }, [splits]);

    const handleConfirm = () => {
        if (totalQuantity !== originalQuantity) {
            alert(`분할된 수량의 합(${totalQuantity}개)이 원래 수량(${originalQuantity}개)과 일치하지 않습니다.`);
            return;
        }

        // 같은 날짜를 가진 항목들을 합치기
        const mergedSplits = {};
        splits.forEach(split => {
            const date = split.date;
            const quantity = parseInt(split.quantity) || 0;
            
            if (mergedSplits[date]) {
                mergedSplits[date] += quantity;
            } else {
                mergedSplits[date] = quantity;
            }
        });

        // 합쳐진 데이터를 배열로 변환
        const splitData = Object.entries(mergedSplits).map(([date, quantity]) => ({
            quantity: quantity,
            date: date
        }));

        onConfirm(splitData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">출고 기록 분할</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        원래 수량: <span className="font-semibold">{originalQuantity}개</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        분할된 수량: <span className={`font-semibold ${totalQuantity === originalQuantity ? 'text-green-600' : 'text-red-600'}`}>
                            {totalQuantity}개
                        </span>
                    </p>
                </div>

                <div className="space-y-3 mb-4">
                    {splits.map((split, index) => (
                        <div key={split.id} className="flex items-center gap-2 p-3 border rounded-lg">
                            <div className="flex-1">
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={split.quantity}
                                        onChange={(e) => updateSplit(split.id, 'quantity', e.target.value)}
                                        className="border rounded px-2 py-1 text-sm w-20"
                                        placeholder="수량"
                                    />
                                    <span className="text-sm text-gray-500 self-center">개</span>
                                    <input
                                        type="date"
                                        value={split.date}
                                        onChange={(e) => updateSplit(split.id, 'date', e.target.value)}
                                        className="border rounded px-2 py-1 text-sm flex-1"
                                    />
                                </div>
                            </div>
                            {splits.length > 1 && (
                                <button
                                    onClick={() => removeSplit(split.id)}
                                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                                >
                                    삭제
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={addSplit}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                        + 분할 추가
                    </button>
                    <div className="text-sm">
                        {totalQuantity === originalQuantity ? (
                            <span className="text-green-600">✓ 수량 일치</span>
                        ) : (
                            <span className="text-red-600">
                                {totalQuantity > originalQuantity ? '초과' : '부족'}: {Math.abs(totalQuantity - originalQuantity)}개
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={totalQuantity !== originalQuantity}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        분할 실행
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SplitOutputModal; 