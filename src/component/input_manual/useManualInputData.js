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
  const saveAllData = useCallback(async (department = 'ITS', businessLocation = null) => {
    if (data.length === 0) {
      setMessage({ type: 'warning', text: '저장할 데이터가 없습니다.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    setIsLoading(true);
    setMessage({ type: 'info', text: '데이터를 저장하는 중...' });

    try {
      // 서버 API 호출
      const response = await fetch('/api/input/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          items: data,
          type: 'manual_input',
          department: department,
          business_location: businessLocation
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: `${data.length}개의 데이터가 성공적으로 저장되었습니다.` });
        setData([]); // 저장 후 데이터 초기화
      } else {
        throw new Error(result.message || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('데이터 저장 오류:', error);
      setMessage({ 
        type: 'error', 
        text: `저장 중 오류가 발생했습니다: ${error.message}` 
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  }, [data]);

  // 데이터 초기화
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
    clearData
  };
}

export default useManualInputData;
