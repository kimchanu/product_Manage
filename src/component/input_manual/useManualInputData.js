import { useState, useCallback } from 'react';

function useManualInputData() {
  const [data, setData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 데이터 업데이트 (통합 폼용)
  const updateData = useCallback((newData) => {
    setData(newData);
  }, []);

  // 데이터 수정
  const editItem = useCallback((index, updatedItem) => {
    setData(prev => prev.map((item, i) =>
      i === index ? { ...item, ...updatedItem } : item
    ));
    setEditingIndex(null);
    setMessage({ type: 'success', text: '데이터가 수정되었습니다.' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  }, []);

  // 데이터 삭제
  const deleteItem = useCallback((index) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      setData(prev => prev.filter((_, i) => i !== index));
      setMessage({ type: 'success', text: '데이터가 삭제되었습니다.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  }, []);

  // 편집 모드 시작
  const startEdit = useCallback((item, index) => {
    setEditingIndex(index);
  }, []);

  // 편집 취소
  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
  }, []);

  // 전체 데이터 저장 (서버로 전송)
  const saveAllData = useCallback(async (department = 'ITS', businessLocation = null, inputDate = null) => {
    if (data.length === 0) {
      setMessage({ type: 'warning', text: '저장할 데이터가 없습니다.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    setIsLoading(true);
    setMessage({ type: 'info', text: '데이터를 저장하는 중...' });

    try {
      // 서버 API 호출
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/materials/input/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          items: data,
          type: 'manual_input',
          department: department,
          business_location: businessLocation,
          date: inputDate || new Date().toISOString().split('T')[0]
        })
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      let result;

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // HTML 응답인 경우 (에러 페이지 등)
        const text = await response.text();
        console.error('서버 응답 (HTML):', text.substring(0, 200));
        throw new Error(`서버 오류가 발생했습니다. (상태 코드: ${response.status})`);
      }

      if (!response.ok) {
        // 테이블이 없는 경우 특별 처리
        if (result.error === 'TABLE_NOT_FOUND') {
          setMessage({
            type: 'error',
            text: result.message || '해당 사업소와 부서의 테이블이 존재하지 않습니다. 관리자에게 문의하세요.'
          });
          return;
        }
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        setMessage({ type: 'success', text: `${data.length}개의 데이터가 성공적으로 저장되었습니다.` });
        setData([]); // 저장 후 데이터 초기화
      } else {
        throw new Error(result.message || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('데이터 저장 오류:', error);

      // JSON 파싱 오류인 경우
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        setMessage({
          type: 'error',
          text: '서버 응답을 처리할 수 없습니다. 서버 오류가 발생했을 수 있습니다. 관리자에게 문의하세요.'
        });
      } else {
        setMessage({
          type: 'error',
          text: `저장 중 오류가 발생했습니다: ${error.message}`
        });
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  }, [data]);

  // api_main_product 저장 (서버로 전송)
  const saveToApiMainProduct = useCallback(async (department = 'ITS', businessLocation = null, inputDate = null) => {
    if (data.length === 0) {
      setMessage({ type: 'warning', text: '저장할 데이터가 없습니다.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    setIsLoading(true);
    setMessage({ type: 'info', text: 'api_main_product에 저장하는 중...' });

    try {
      // 서버 API 호출
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/materials/input/manual/api-main`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          items: data,
          type: 'manual_input',
          department: department,
          business_location: businessLocation,
          date: inputDate || new Date().toISOString().split('T')[0]
        })
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      let result;

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // HTML 응답인 경우 (에러 페이지 등)
        const text = await response.text();
        console.error('서버 응답 (HTML):', text.substring(0, 200));
        throw new Error(`서버 오류가 발생했습니다. (상태 코드: ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'api_main_product에 성공적으로 저장되었습니다.' });
        // 데이터 초기화는 하지 않음 (사용자가 원할 경우 전체 삭제 버튼 사용)
      } else {
        throw new Error(result.message || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('데이터 저장 오류:', error);

      // JSON 파싱 오류인 경우
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        setMessage({
          type: 'error',
          text: '서버 응답을 처리할 수 없습니다. 서버 오류가 발생했을 수 있습니다. 관리자에게 문의하세요.'
        });
      } else {
        setMessage({
          type: 'error',
          text: `저장 중 오류가 발생했습니다: ${error.message}`
        });
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  }, [data]);

  const clearData = useCallback(() => {
    if (data.length > 0 && window.confirm('모든 데이터를 삭제하시겠습니까?')) {
      setData([]);
      setEditingIndex(null);
      setMessage({ type: 'info', text: '데이터가 초기화되었습니다.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  }, [data]);

  return {
    data,
    editingIndex,
    isLoading,
    message,
    updateData,
    editItem,
    deleteItem,
    startEdit,
    cancelEdit,
    saveAllData,
    saveToApiMainProduct,
    clearData
  };
}

export default useManualInputData;
