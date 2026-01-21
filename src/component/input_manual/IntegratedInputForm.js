import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

function IntegratedInputForm({ data, onDataChange, onSaveAll, onClear, isLoading, user }) {
  const [formData, setFormData] = useState(data || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedBusinessLocation, setSelectedBusinessLocation] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ITS');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]); // 오늘 날짜를 기본값으로
  const [purchaseInfo, setPurchaseInfo] = useState({
    purchaseNumber: '',
    vatType: '별도',
    budget: 0,
    executedAmount: 0,
    currentExecution: 0,
    remainingAmount: 0
  });
  const [loadingBudget, setLoadingBudget] = useState(false);

  // data가 변경될 때 formData 업데이트
  useEffect(() => {
    setFormData(data || []);
  }, [data]);

  // 사용자 정보가 로드되면 기본 사업소 설정
  useEffect(() => {
    if (user?.business_location && !selectedBusinessLocation) {
      setSelectedBusinessLocation(user.business_location);
    }
  }, [user]);

  // 예산 데이터 가져오기
  const fetchBudgetData = async (department, businessLocation) => {
    // 사업소가 선택되지 않으면 조회하지 않음
    if (!businessLocation) {
      console.log('사업소가 선택되지 않아서 예산 데이터를 조회하지 않습니다.');
      return;
    }

    setLoadingBudget(true);
    try {
      const currentYear = new Date().getFullYear();
      
      // 사업소 코드를 전체 이름으로 변환
      const businessLocationMap = {
        'GK': 'GK사업소',
        'CM': '천마사업소',
        'ES': '을숙도사업소'
      };
      const businessLocationName = businessLocationMap[businessLocation] || businessLocation;
      
      // 예산 조회
      const budgetResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/budget?year=${currentYear}`);
      if (!budgetResponse.ok) throw new Error("예산 조회 실패");
      const budgetData = await budgetResponse.json();
      
      console.log('예산 데이터:', budgetData);
      console.log('조회 조건 - 사업소 코드:', businessLocation, '사업소 이름:', businessLocationName, '부서:', department);
      
      // 해당 사업소와 부서의 예산 찾기 (다양한 형식의 사업소 이름 매칭)
      const departmentBudget = budgetData.budget?.find(
        item => {
          // 부서 매칭 확인
          if (item.department !== department) {
            return false;
          }
          
          // 사업소 매칭 (다양한 형식 지원)
          const site = item.site || '';
          const siteLower = site.toLowerCase();
          const businessLocationLower = businessLocation.toLowerCase();
          const businessLocationNameLower = businessLocationName.toLowerCase();
          
          // 정확한 매칭
          if (site === businessLocationName || site === businessLocation) {
            return true;
          }
          
          // 부분 매칭 (코드가 포함되어 있는지)
          if (siteLower.includes(businessLocationLower) || businessLocationLower.includes(siteLower)) {
            return true;
          }
          
          // 사업소 이름이 포함되어 있는지
          if (siteLower.includes(businessLocationNameLower) || businessLocationNameLower.includes(siteLower)) {
            return true;
          }
          
          // 사업소 코드 매핑으로 확인
          const reverseMap = {
            'gk': ['gk', 'gk사업소'],
            'cm': ['cm', '천마', '천마사업소'],
            'es': ['es', '을숙도', '을숙도사업소']
          };
          
          const locationKeys = reverseMap[businessLocationLower] || [];
          for (const key of locationKeys) {
            if (siteLower.includes(key)) {
              return true;
            }
          }
          
          return false;
        }
      );
      
      console.log('찾은 예산:', departmentBudget);
      if (!departmentBudget) {
        console.warn('예산을 찾을 수 없습니다.');
        console.warn('조회 조건 - 사업소:', businessLocation, businessLocationName, '부서:', department);
        console.warn('전체 예산 데이터:', budgetData.budget);
        console.warn('해당 부서의 예산:', budgetData.budget?.filter(item => item.department === department));
      }
      
      // 연간 총 입고 금액 조회 (기집행액) - 테이블이 없어도 예산은 표시해야 함
      let executedAmount = 0;
      try {
        const statementResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/statement`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            businessLocation: businessLocation,
            department: department,
            year: currentYear,
            month: new Date().getMonth() + 1,
            categories: department === "ITS" ? ["TCS", "FTMS", "전산", "기타", "합 계"] :
                       department === "기전" ? ["전기", "기계", "소방", "기타", "합 계"] :
                       ["안전", "장비", "시설보수", "조경", "기타", "합 계"]
          })
        });
        
        if (statementResponse.ok) {
          const statementData = await statementResponse.json();
          executedAmount = statementData.yearTotalInputAmount || 0;
        } else {
          // 테이블이 없거나 에러가 발생해도 집행액은 0으로 처리
          const errorData = await statementResponse.json().catch(() => ({}));
          console.warn('집행액 조회 실패 (테이블이 없을 수 있음):', errorData);
          executedAmount = 0;
        }
      } catch (statementError) {
        // 집행액 조회 실패해도 예산은 표시
        console.warn('집행액 조회 중 오류 발생 (테이블이 없을 수 있음):', statementError);
        executedAmount = 0;
      }
      
      const budget = departmentBudget ? Number(departmentBudget.amount) : 0;
      const currentExecution = 0; // 현재 집행액은 0으로 초기화 (입고 데이터가 저장되면 업데이트)
      const remainingAmount = budget - executedAmount;
      
      console.log('예산:', budget, '기집행액:', executedAmount, '잔액:', remainingAmount);
      
      setPurchaseInfo(prev => ({
        ...prev,
        budget,
        executedAmount,
        currentExecution,
        remainingAmount
      }));
      
    } catch (error) {
      console.error('예산 데이터 조회 실패:', error);
      setPurchaseInfo(prev => ({
        ...prev,
        budget: 0,
        executedAmount: 0,
        currentExecution: 0,
        remainingAmount: 0
      }));
    } finally {
      setLoadingBudget(false);
    }
  };

  // 사업소 또는 부서 변경 시 예산 데이터 다시 가져오기
  useEffect(() => {
    if (selectedBusinessLocation) {
      fetchBudgetData(selectedDepartment, selectedBusinessLocation);
    }
  }, [selectedDepartment, selectedBusinessLocation]);

  // 새 행 추가
  const addRow = () => {
    if (!purchaseInfo.purchaseNumber.trim()) {
      alert('구매번호를 먼저 입력해주세요.');
      return;
    }

    const newRow = {
      id: uuidv4(),
      자재코드: purchaseInfo.purchaseNumber, // 구매번호를 자재코드로 사용
      품명: '',
      규격: '',
      단가: '',
      입고수량: '',
      isNew: true
    };
    const newData = [...formData, newRow];
    setFormData(newData);
    onDataChange(newData);
    setEditingIndex(newData.length - 1);
  };

  // 행 삭제
  const deleteRow = (index) => {
    if (window.confirm('정말로 이 행을 삭제하시겠습니까?')) {
      const newData = formData.filter((_, i) => i !== index);
      setFormData(newData);
      onDataChange(newData);
      if (editingIndex === index) {
        setEditingIndex(null);
      } else if (editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  // 전체 삭제
  const handleClearAll = () => {
    if (window.confirm('모든 데이터를 삭제하시겠습니까?')) {
      onClear();
      setInputDate(new Date().toISOString().split('T')[0]); // 날짜를 오늘로 초기화
    }
  };

  // 편집 모드 시작
  const startEdit = (index) => {
    const newData = [...formData];
    // 단가와 입고수량이 숫자로 저장되어 있으면 포맷팅 적용
    const updates = {};
    if (typeof newData[index].단가 === 'number') {
      updates.단가 = formatNumberInput(newData[index].단가.toString());
    }
    if (typeof newData[index].입고수량 === 'number') {
      updates.입고수량 = formatNumberInput(newData[index].입고수량.toString());
    }
    if (Object.keys(updates).length > 0) {
      newData[index] = {
        ...newData[index],
        ...updates
      };
      setFormData(newData);
      onDataChange(newData);
    }
    setEditingIndex(index);
  };

  // 편집 취소
  const cancelEdit = () => {
    setEditingIndex(null);
    setErrors({});
  };

  // 숫자 포맷팅 (쉼표 추가)
  const formatNumberInput = (value) => {
    if (!value) return '';
    
    // 숫자가 아닌 문자 제거 (쉼표 제외)
    let numericValue = value.toString().replace(/[^\d.]/g, '');
    if (!numericValue) return '';
    
    // 소수점이 여러 개인 경우 첫 번째만 유지
    const dotIndex = numericValue.indexOf('.');
    if (dotIndex !== -1) {
      numericValue = numericValue.substring(0, dotIndex + 1) + numericValue.substring(dotIndex + 1).replace(/\./g, '');
    }
    
    // 소수점 처리
    const parts = numericValue.split('.');
    const integerPart = parts[0] ? parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
    const decimalPart = parts[1] ? '.' + parts[1].substring(0, 2) : ''; // 소수점 2자리까지만
    
    return integerPart + decimalPart;
  };

  // 포맷된 숫자를 실제 숫자로 변환 (쉼표 제거)
  const parseFormattedNumber = (value) => {
    if (!value) return '';
    return value.toString().replace(/,/g, '');
  };

  // 입력값 변경
  const handleInputChange = (index, field, value) => {
    const newData = [...formData];
    
    // 단가와 입고수량 필드는 포맷팅 적용
    if (field === '단가' || field === '입고수량') {
      const formattedValue = formatNumberInput(value);
      newData[index] = { ...newData[index], [field]: formattedValue };
    } else {
      newData[index] = { ...newData[index], [field]: value };
    }
    
    setFormData(newData);
    onDataChange(newData);

    // 에러 메시지 제거
    if (errors[`${index}-${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${index}-${field}`];
        return newErrors;
      });
    }
  };

  // 행 저장
  const saveRow = (index) => {
    const row = formData[index];
    const rowErrors = {};

    // 유효성 검사
    if (!row.품명?.trim()) {
      rowErrors[`${index}-품명`] = '품명은 필수입니다.';
    }
    
    // 단가 검증 (쉼표 제거 후 숫자 변환)
    const 단가Value = parseFormattedNumber(row.단가);
    if (!단가Value || isNaN(단가Value) || Number(단가Value) < 0) {
      rowErrors[`${index}-단가`] = '단가는 0 이상의 숫자여야 합니다.';
    }
    
    // 입고수량 검증 (쉼표 제거 후 숫자 변환)
    const 입고수량Value = parseFormattedNumber(row.입고수량);
    if (!입고수량Value || isNaN(입고수량Value) || Number(입고수량Value) < 0) {
      rowErrors[`${index}-입고수량`] = '입고수량은 0 이상의 숫자여야 합니다.';
    }

    if (Object.keys(rowErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...rowErrors }));
      return;
    }

    // 데이터 정리
    const newData = [...formData];
    newData[index] = {
      ...newData[index],
      단가: Number(단가Value) || 0,
      입고수량: Number(입고수량Value) || 0,
      isNew: false
    };
    setFormData(newData);
    onDataChange(newData);
    setEditingIndex(null);
    setErrors({});
  };

  // 숫자 포맷팅
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '0';
    return Number(value).toLocaleString();
  };

  // 총합 계산
  const calculateTotal = (field) => {
    return formData.reduce((sum, item) => {
      // 포맷된 숫자(쉼표 포함)를 파싱하여 계산
      const value = parseFloat(parseFormattedNumber(item[field])) || 0;
      return sum + value;
    }, 0);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* 구매 정보 테이블 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">구매 정보</h3>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">사업소 선택:</label>
            <select
              value={selectedBusinessLocation}
              onChange={(e) => setSelectedBusinessLocation(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingBudget}
            >
              <option value="">선택하세요</option>
              <option value="GK">GK사업소</option>
              <option value="CM">천마사업소</option>
              <option value="ES">을숙도사업소</option>
            </select>
            <label className="text-sm font-medium text-gray-700 ml-3">부서 선택:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingBudget}
            >
              <option value="ITS">ITS</option>
              <option value="기전">기전</option>
              <option value="시설">시설</option>
            </select>
            {loadingBudget && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                로딩 중...
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <span className="w-24 font-medium text-gray-700">구매번호 *</span>
            <input
              type="text"
              value={purchaseInfo.purchaseNumber}
              onChange={(e) => setPurchaseInfo(prev => ({ ...prev, purchaseNumber: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="구매번호를 입력하세요"
              required
            />
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-700">부가세구분</span>
            <span className="text-gray-900">{purchaseInfo.vatType}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 font-medium text-gray-700">입고 날짜 *</span>
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-700">예산</span>
            <span className="text-gray-900 font-mono">
              {loadingBudget ? '로딩 중...' : `${purchaseInfo.budget.toLocaleString()}원`}
            </span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-700">기집행액</span>
            <span className="text-gray-900 font-mono">
              {loadingBudget ? '로딩 중...' : `${purchaseInfo.executedAmount.toLocaleString()}원`}
            </span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-700">금회집행액</span>
            <span className="text-gray-900 font-mono">{purchaseInfo.currentExecution.toLocaleString()}원</span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-700">잔액</span>
            <span className={`font-mono ${purchaseInfo.remainingAmount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {loadingBudget ? '로딩 중...' : `${purchaseInfo.remainingAmount.toLocaleString()}원`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">입고 데이터 입력</h2>
        <div className="flex space-x-3">
          <button
            onClick={addRow}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + 행 추가
          </button>
          {formData.length > 0 && (
            <>
              <button
                onClick={() => onSaveAll(selectedDepartment, selectedBusinessLocation, inputDate)}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? '저장 중...' : '전체 저장'}
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                전체 삭제
              </button>
            </>
          )}
        </div>
      </div>

      {formData.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p className="mb-4">아직 입력된 데이터가 없습니다.</p>
          <button
            onClick={addRow}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            첫 번째 행 추가하기
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">품명 *</th>
                <th className="border p-2 text-left">규격</th>
                <th className="border p-2 text-right">단가 *</th>
                <th className="border p-2 text-right">입고수량 *</th>
                <th className="border p-2 text-right">총금액</th>
                <th className="border p-2 text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((row, index) => {
                const isEditing = editingIndex === index;
                // 포맷된 숫자(쉼표 포함)를 파싱하여 계산
                const 단가 = parseFloat(parseFormattedNumber(row.단가)) || 0;
                const 입고수량 = parseFloat(parseFormattedNumber(row.입고수량)) || 0;
                const totalAmount = 단가 * 입고수량;
                
                return (
                  <tr key={row.id || index} className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''}`}>

                    {/* 품명 */}
                    <td className="border p-1">
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            value={row.품명 || ''}
                            onChange={(e) => handleInputChange(index, '품명', e.target.value)}
                            className={`w-full px-2 py-1 border rounded text-sm ${
                              errors[`${index}-품명`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="품명"
                          />
                          {errors[`${index}-품명`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`${index}-품명`]}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm">{row.품명 || '-'}</span>
                      )}
                    </td>

                    {/* 규격 */}
                    <td className="border p-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.규격 || ''}
                          onChange={(e) => handleInputChange(index, '규격', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="규격"
                        />
                      ) : (
                        <span className="text-sm">{row.규격 || '-'}</span>
                      )}
                    </td>

                    {/* 단가 */}
                    <td className="border p-1 text-right">
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            value={row.단가 || ''}
                            onChange={(e) => handleInputChange(index, '단가', e.target.value)}
                            className={`w-full px-2 py-1 border rounded text-sm text-right font-mono ${
                              errors[`${index}-단가`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                            inputMode="numeric"
                          />
                          {errors[`${index}-단가`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`${index}-단가`]}</p>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-sm">{formatNumber(row.단가)}</span>
                      )}
                    </td>

                    {/* 입고수량 */}
                    <td className="border p-1 text-right">
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            value={row.입고수량 || ''}
                            onChange={(e) => handleInputChange(index, '입고수량', e.target.value)}
                            className={`w-full px-2 py-1 border rounded text-sm text-right font-mono ${
                              errors[`${index}-입고수량`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                            inputMode="numeric"
                          />
                          {errors[`${index}-입고수량`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`${index}-입고수량`]}</p>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-sm">{formatNumber(row.입고수량)}</span>
                      )}
                    </td>

                    {/* 총금액 */}
                    <td className="border p-1 text-right">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {formatNumber(totalAmount)}
                      </span>
                    </td>

                    {/* 작업 버튼 */}
                    <td className="border p-1 text-center">
                      <div className="flex justify-center space-x-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveRow(index)}
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 focus:outline-none focus:ring-1 focus:ring-green-500"
                            >
                              저장
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(index)}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => deleteRow(index)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td className="border p-2 text-right" colSpan="3">
                  합계
                </td>
                <td className="border p-2 text-right font-mono">
                  {formatNumber(calculateTotal('입고수량'))}
                </td>
                <td className="border p-2 text-right font-mono text-blue-600">
                  {formatNumber(
                    formData.reduce((sum, item) => {
                      const 단가 = parseFloat(parseFormattedNumber(item.단가)) || 0;
                      const 입고수량 = parseFloat(parseFormattedNumber(item.입고수량)) || 0;
                      return sum + (단가 * 입고수량);
                    }, 0)
                  )}
                </td>
                <td className="border p-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {formData.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          총 {formData.length}개 항목
        </div>
      )}
    </div>
  );
}

export default IntegratedInputForm;
