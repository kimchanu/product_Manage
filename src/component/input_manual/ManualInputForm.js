import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function ManualInputForm({ onAddItem }) {
  const [formData, setFormData] = useState({
    자재코드: '',
    품명: '',
    규격: '',
    단위: '',
    단가: '',
    입고수량: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.자재코드.trim()) {
      newErrors.자재코드 = '자재코드는 필수입니다.';
    }
    if (!formData.품명.trim()) {
      newErrors.품명 = '품명은 필수입니다.';
    }
    if (!formData.단위.trim()) {
      newErrors.단위 = '단위는 필수입니다.';
    }
    if (!formData.단가 || isNaN(formData.단가) || Number(formData.단가) < 0) {
      newErrors.단가 = '단가는 0 이상의 숫자여야 합니다.';
    }
    if (!formData.입고수량 || isNaN(formData.입고수량) || Number(formData.입고수량) < 0) {
      newErrors.입고수량 = '입고수량은 0 이상의 숫자여야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newItem = {
      ...formData,
      id: uuidv4(),
      단가: Number(formData.단가) || 0,
      입고수량: Number(formData.입고수량) || 0
    };

    onAddItem(newItem);
    
    // 폼 초기화
    setFormData({
      자재코드: '',
      품명: '',
      규격: '',
      단위: '',
      단가: '',
      입고수량: ''
    });
  };

  const handleReset = () => {
    setFormData({
      자재코드: '',
      품명: '',
      규격: '',
      단위: '',
      단가: '',
      입고수량: ''
    });
    setErrors({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">수동 입고 데이터 입력</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 자재코드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              자재코드 *
            </label>
            <input
              type="text"
              name="자재코드"
              value={formData.자재코드}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.자재코드 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="자재코드를 입력하세요"
            />
            {errors.자재코드 && (
              <p className="text-red-500 text-xs mt-1">{errors.자재코드}</p>
            )}
          </div>

          {/* 품명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              품명 *
            </label>
            <input
              type="text"
              name="품명"
              value={formData.품명}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.품명 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="품명을 입력하세요"
            />
            {errors.품명 && (
              <p className="text-red-500 text-xs mt-1">{errors.품명}</p>
            )}
          </div>

          {/* 규격 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              규격
            </label>
            <input
              type="text"
              name="규격"
              value={formData.규격}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="규격을 입력하세요"
            />
          </div>

          {/* 단위 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              단위 *
            </label>
            <input
              type="text"
              name="단위"
              value={formData.단위}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.단위 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="단위를 입력하세요 (예: 개, kg, m)"
            />
            {errors.단위 && (
              <p className="text-red-500 text-xs mt-1">{errors.단위}</p>
            )}
          </div>

          {/* 단가 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              단가 *
            </label>
            <input
              type="number"
              name="단가"
              value={formData.단가}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.단가 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.단가 && (
              <p className="text-red-500 text-xs mt-1">{errors.단가}</p>
            )}
          </div>

          {/* 입고수량 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              입고수량 *
            </label>
            <input
              type="number"
              name="입고수량"
              value={formData.입고수량}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.입고수량 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.입고수량 && (
              <p className="text-red-500 text-xs mt-1">{errors.입고수량}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            초기화
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            추가
          </button>
        </div>
      </form>
    </div>
  );
}

export default ManualInputForm;
