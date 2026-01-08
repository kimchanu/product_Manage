import React from 'react';

function ManualInputTable({ data, onEdit, onDelete, onSaveAll }) {
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '0';
    return Number(value).toLocaleString();
  };

  const calculateTotal = (field) => {
    return data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
  };

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">입력된 데이터</h3>
        <div className="text-center text-gray-500 py-8">
          아직 입력된 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">입력된 데이터 ({data.length}개)</h3>
        <button
          onClick={onSaveAll}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          전체 저장
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">자재코드</th>
              <th className="border p-2 text-left">품명</th>
              <th className="border p-2 text-left">규격</th>
              <th className="border p-2 text-center">단위</th>
              <th className="border p-2 text-right">단가</th>
              <th className="border p-2 text-right">입고수량</th>
              <th className="border p-2 text-right">총금액</th>
              <th className="border p-2 text-center">작업</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const totalAmount = (Number(item.단가) || 0) * (Number(item.입고수량) || 0);
              
              return (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  <td className="border p-2 font-mono text-sm">{item.자재코드}</td>
                  <td className="border p-2">{item.품명}</td>
                  <td className="border p-2">{item.규격 || '-'}</td>
                  <td className="border p-2 text-center">{item.단위}</td>
                  <td className="border p-2 text-right font-mono">
                    {formatNumber(item.단가)}
                  </td>
                  <td className="border p-2 text-right font-mono">
                    {formatNumber(item.입고수량)}
                  </td>
                  <td className="border p-2 text-right font-mono font-semibold text-blue-600">
                    {formatNumber(totalAmount)}
                  </td>
                  <td className="border p-2 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onEdit(item, index)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => onDelete(index)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td className="border p-2 text-right" colSpan="5">
                합계
              </td>
              <td className="border p-2 text-right font-mono">
                {formatNumber(calculateTotal('입고수량'))}
              </td>
              <td className="border p-2 text-right font-mono text-blue-600">
                {formatNumber(
                  data.reduce((sum, item) => 
                    sum + ((Number(item.단가) || 0) * (Number(item.입고수량) || 0)), 0
                  )
                )}
              </td>
              <td className="border p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default ManualInputTable;
