import React, { useState } from 'react';

function TableCreator({ user }) {
  const [selectedBusinessLocation, setSelectedBusinessLocation] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ITS');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [tableStatus, setTableStatus] = useState(null);

  // 사용자 정보가 로드되면 기본 사업소 설정
  React.useEffect(() => {
    if (user?.business_location && !selectedBusinessLocation) {
      setSelectedBusinessLocation(user.business_location);
    }
  }, [user]);

  // 테이블 존재 여부 확인
  const checkTables = async () => {
    if (!selectedBusinessLocation || !selectedDepartment) {
      setMessage({ type: 'warning', text: '사업소와 부서를 선택해주세요.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/upload/check-tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          businessLocation: selectedBusinessLocation,
          department: selectedDepartment
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTableStatus(result);
        if (result.exists) {
          setMessage({ 
            type: 'info', 
            text: `테이블이 이미 존재합니다. (${result.tableNames.input})` 
          });
        } else {
          setMessage({ 
            type: 'warning', 
            text: '테이블이 존재하지 않습니다. 테이블을 생성해주세요.' 
          });
        }
      } else {
        setMessage({ type: 'error', text: result.message || '테이블 확인 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('테이블 확인 오류:', error);
      setMessage({ type: 'error', text: '테이블 확인 중 오류가 발생했습니다.' });
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // 테이블 생성
  const createTables = async () => {
    if (!selectedBusinessLocation || !selectedDepartment) {
      setMessage({ type: 'warning', text: '사업소와 부서를 선택해주세요.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    if (!window.confirm(`다음 테이블들을 생성하시겠습니까?\n- ${selectedBusinessLocation}_${selectedDepartment}_input\n- ${selectedBusinessLocation}_${selectedDepartment}_output\n- ${selectedBusinessLocation}_${selectedDepartment}_product`)) {
      return;
    }

    setIsCreating(true);
    setMessage({ type: 'info', text: '테이블을 생성하는 중...' });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/upload/create-tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          businessLocation: selectedBusinessLocation,
          department: selectedDepartment
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: result.message });
        setTableStatus({ exists: true });
      } else {
        setMessage({ type: 'error', text: result.message || '테이블 생성 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('테이블 생성 오류:', error);
      setMessage({ type: 'error', text: '테이블 생성 중 오류가 발생했습니다.' });
    } finally {
      setIsCreating(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">DB 테이블 생성</h3>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">사업소 선택:</label>
          <select
            value={selectedBusinessLocation}
            onChange={(e) => {
              setSelectedBusinessLocation(e.target.value);
              setTableStatus(null);
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
          >
            <option value="">선택하세요</option>
            <option value="GK">GK사업소</option>
            <option value="천마사업소">천마사업소</option>
            <option value="을숙도사업소">을숙도사업소</option>
            <option value="강남사업소">강남사업소</option>
            <option value="수원사업소">수원사업소</option>
          </select>
          <label className="text-sm font-medium text-gray-700 ml-3">부서 선택:</label>
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setTableStatus(null);
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
          >
            <option value="ITS">ITS</option>
            <option value="기전">기전</option>
            <option value="시설">시설</option>
          </select>
        </div>
      </div>

      {/* 메시지 표시 */}
      {message.text && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
          message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
          message.type === 'warning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
          'bg-blue-100 text-blue-700 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* 테이블 상태 표시 */}
      {tableStatus && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
          <div className="font-medium mb-2">테이블 상태:</div>
          <div className="space-y-1">
            <div className={tableStatus.tables?.input ? 'text-green-600' : 'text-red-600'}>
              • {tableStatus.tableNames?.input}: {tableStatus.tables?.input ? '✓ 존재' : '✗ 없음'}
            </div>
            <div className={tableStatus.tables?.output ? 'text-green-600' : 'text-red-600'}>
              • {tableStatus.tableNames?.output}: {tableStatus.tables?.output ? '✓ 존재' : '✗ 없음'}
            </div>
            <div className={tableStatus.tables?.product ? 'text-green-600' : 'text-red-600'}>
              • {tableStatus.tableNames?.product}: {tableStatus.tables?.product ? '✓ 존재' : '✗ 없음'}
            </div>
          </div>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex space-x-3">
        <button
          onClick={checkTables}
          disabled={isCreating || !selectedBusinessLocation || !selectedDepartment}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          테이블 확인
        </button>
        <button
          onClick={createTables}
          disabled={isCreating || !selectedBusinessLocation || !selectedDepartment}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? '생성 중...' : '테이블 생성'}
        </button>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
        <p className="font-medium mb-1">⚠️ 안내사항</p>
        <p>입고 데이터를 저장하기 전에 반드시 테이블을 생성해주세요. 테이블이 없으면 데이터 저장 시 오류가 발생합니다.</p>
      </div>
    </div>
  );
}

export default TableCreator;
