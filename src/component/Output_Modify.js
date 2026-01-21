import React, { useState, useEffect, useCallback } from "react";
import User_info from "./User_info";
import ModifyFilters from "./output_modify/ModifyFilters";
import ModifyTableHeader from "./output_modify/ModifyTableHeader";
import ModifyRow from "./output_modify/ModifyRow";
import ModifyBatchEdit from "./output_modify/ModifyBatchEdit";
import SplitOutputModal from "./output_modify/SplitOutputModal";

const Modify = () => {
  const [materials, setMaterials] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState("");
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editedRow, setEditedRow] = useState({});
  const [batchEditMode, setBatchEditMode] = useState(null);
  const [batchEditValue, setBatchEditValue] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  // 무한 스크롤: 보여줄 자재 개수 상태
  const [visibleCount, setVisibleCount] = useState(20);
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [splitTarget, setSplitTarget] = useState(null);
  // 전부보기 모드 상태
  const [isViewAllMode, setIsViewAllMode] = useState(false);

  // filteredMaterials를 가장 먼저 선언
  const filteredMaterials = materials.flatMap((material) => {
    const totalInput = material.inputs?.reduce((acc, cur) => acc + (cur.quantity || 0), 0) || 0;
    const totalOutput = material.outputs?.reduce((acc, cur) => acc + (cur.quantity || 0), 0) || 0;
    const remainingQuantity = totalInput - totalOutput;
    const remainingPrice = remainingQuantity * (material.price || 0);

    return material.outputs?.length > 0
      ? material.outputs
        .map((output) => ({
          material_code: material.material_code,
          name: material.name,
          specification: material.specification,
          price: material.price,
          output_quantity: output.quantity,
          output_date: output.date,
          output_user: output.user_id,
          output_comment: output.comment,
          remaining_quantity: remainingQuantity,
          remaining_price: remainingPrice,
          output_id: output.id,
          material_id: material.material_id,
          location: material.location,
          big_category: material.big_category,
          category: material.category,
          sub_category: material.sub_category,
          manufacturer: material.manufacturer,
          unit: material.unit,
        }))
        .filter((output) => {
          const outputDate = new Date(output.output_date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          const matchesSearch =
            output.material_code?.includes(searchTerm) ||
            output.name?.includes(searchTerm) ||
            output.specification?.includes(searchTerm) ||
            material.category?.includes(searchTerm) ||
            material.sub_category?.includes(searchTerm);

          const inDateRange = (!start || outputDate >= start) && (!end || outputDate <= end);

          // 출고 수량이 1 이상인 경우만 필터링
          const hasValidQuantity = output.output_quantity >= 1;

          return matchesSearch && inDateRange && hasValidQuantity;
        })
      : [];
  });

  // 검색/필터가 바뀌면 visibleCount를 초기화하고 수정 모드 해제
  useEffect(() => {
    if (isViewAllMode) {
      setVisibleCount(100000); // 충분히 큰 값으로 설정하여 모두 표시
    } else {
      setVisibleCount(20);
    }
    setSelectedRows(new Set()); // 검색/필터/데이터 바뀔 때 체크박스 해제
    setEditRowIndex(null); // 수정 모드 해제
    setEditedRow({}); // 수정 데이터 초기화
  }, [searchTerm, startDate, endDate, materials, isViewAllMode]);

  // 필터 변경 핸들러들
  const handleStartDateChange = (value) => {
    setStartDate(value);
    setIsViewAllMode(false);
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
    setIsViewAllMode(false);
  };

  const handleSearchTermChange = (value) => {
    setSearchTerm(value);
    setIsViewAllMode(false);
  };

  const handleViewAll = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setIsViewAllMode(true);
  };

  // 무한 스크롤 핸들러
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setVisibleCount((prev) => Math.min(prev + 20, filteredMaterials.length));
    }
  }, [filteredMaterials.length]);

  // 보여줄 데이터
  const pagedMaterials = filteredMaterials.slice(0, visibleCount);

  const fetchData = async (userInfo = user) => {
    if (!userInfo?.business_location || !userInfo?.department) {
      console.log('Missing user info:', { business_location: userInfo?.business_location, department: userInfo?.department });
      return;
    }

    try {
      console.log('Sending request with:', {
        businessLocation: userInfo.business_location,
        department: userInfo.department
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          businessLocation: userInfo.business_location,
          department: userInfo.department,
        }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('서버 응답을 JSON으로 파싱할 수 없습니다.');
      }

      if (!response.ok) {
        throw new Error(result.message || `서버 오류 (${response.status})`);
      }

      // 데이터 형식 검증 및 변환
      let processedData = result;
      if (!Array.isArray(result)) {
        if (result.data && Array.isArray(result.data)) {
          processedData = result.data;
        } else if (typeof result === 'object') {
          processedData = [result];
        } else {
          console.error('Unexpected data format:', result);
          throw new Error('서버에서 받은 데이터 형식이 올바르지 않습니다.');
        }
      }

      console.log('Processed materials data:', processedData);
      setMaterials(processedData);
    } catch (error) {
      console.error("서버 요청 오류:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        userInfo: {
          business_location: userInfo?.business_location,
          department: userInfo?.department
        }
      });
      setMaterials([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleEditClick = (index) => {
    setEditRowIndex(index);
    const currentRow = filteredMaterials[index];
    setEditedRow({
      output_date: currentRow.output_date || new Date().toISOString().split('T')[0],
      output_user: currentRow.output_user || '-',
      output_comment: currentRow.output_comment || '-',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedRow((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async (index) => {
    const target = filteredMaterials[index];
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/materials/output/${target.material_id}/${target.output_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          output_date: editedRow.output_date || target.output_date,
          user_id: editedRow.output_user || target.output_user,
          comment: editedRow.output_comment || target.output_comment,
          business_location: user?.business_location,
          department: user?.department
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '수정 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      alert(result.message);
      setEditRowIndex(null);
      setEditedRow({});
      fetchData(); // 데이터 새로고침
    } catch (error) {
      console.error('수정 중 오류 발생:', error);
      alert(error.message);
    }
  };

  const handleDeleteClick = async (index) => {
    const target = filteredMaterials[index];
    if (!window.confirm('정말로 이 출고 기록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/materials/output/${target.material_id}/${target.output_id}`, {
        body: JSON.stringify({
          business_location: user?.business_location,
          department: user?.department
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '삭제 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      alert(result.message);
      fetchData(); // 데이터 새로고침
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
      alert(error.message);
    }
  };

  // 출고 기록 분할 모달 열기
  const handleSplitOutput = (index) => {
    const target = filteredMaterials[index];
    setSplitTarget(target);
    setSplitModalOpen(true);
  };

  // 분할 실행
  const handleSplitConfirm = async (splitData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/materials/output/split/${splitTarget.material_id}/${splitTarget.output_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          splits: splitData,
          business_location: user?.business_location,
          department: user?.department
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '출고 기록 분할 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      alert(result.message);
      fetchData(); // 데이터 새로고침
    } catch (error) {
      console.error('출고 기록 분할 중 오류 발생:', error);
      alert(`출고 기록 분할 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 전체 체크박스 상태 (pagedMaterials 기준)
  const allChecked = pagedMaterials.length > 0 && pagedMaterials.every((_, idx) => selectedRows.has(idx));
  const isIndeterminate = pagedMaterials.some((_, idx) => selectedRows.has(idx)) && !allChecked;

  // 전체 체크박스 핸들러 (보이는 것만)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // 보이는 것만 추가
      const newRows = new Set(selectedRows);
      pagedMaterials.forEach((_, idx) => newRows.add(idx));
      setSelectedRows(newRows);
    } else {
      // 보이는 것만 해제
      const newRows = new Set(selectedRows);
      pagedMaterials.forEach((_, idx) => newRows.delete(idx));
      setSelectedRows(newRows);
    }
  };

  const handleRowSelect = (idx) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(idx)) {
      newSelectedRows.delete(idx);
    } else {
      newSelectedRows.add(idx);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleHeaderClick = (column) => {
    if (batchEditMode === column) {
      setBatchEditMode(null);
      setBatchEditValue("");
    } else {
      setBatchEditMode(column);
      setBatchEditValue("");
    }
  };

  const handleBatchEdit = async () => {
    if (!batchEditMode || !batchEditValue) return;

    const rowsToUpdate = filteredMaterials.filter((_, idx) => selectedRows.has(idx));

    if (rowsToUpdate.length === 0) {
      alert("수정할 행을 선택해주세요.");
      return;
    }

    // 사용자 정보 확인
    if (!user?.business_location || !user?.department) {
      alert("사용자 정보(사업소/부서)가 없습니다.");
      return;
    }

    try {
      const updates = rowsToUpdate.map(row => {
        if (!row.output_id) {
          throw new Error('출고 ID가 없습니다.');
        }

        return {
          id: row.output_id,
          material_id: row.material_id, // backend doesn't strictly need this for update if we use ID, but good to have
          output_date: batchEditMode === 'date' ? batchEditValue : row.output_date,
          user_id: batchEditMode === 'user' ? batchEditValue : row.output_user,
          comment: batchEditMode === 'comment' ? batchEditValue : row.output_comment,
          quantity: row.output_quantity // 수량은 변경하지 않음
        };
      });

      console.log(`Sending batch update for ${updates.length} rows`);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/materials/output/batch-update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          updates,
          business_location: user.business_location,
          department: user.department
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '서버 응답을 파싱할 수 없습니다.' }));
        throw new Error(errorData.message || '일괄 수정 실패');
      }

      await response.json();
      alert("일괄 수정이 완료되었습니다.");

      // 데이터 새로고침
      // fetchMaterials(); // This function availability needs checking, usually we modify state or reload
      window.location.reload(); // Simplest way to refresh everything

    } catch (error) {
      console.error("일괄 수정 오류:", error);
      alert(`일괄 수정 중 오류 발생: ${error.message}`);
    }
  };



  return (
    <div>
      <User_info setUser={setUser} />
      <div className="p-4 max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">출고 현황</h1>
        <div style={{ width: '70%', margin: '0 auto' }}>
          <ModifyFilters
            startDate={startDate}
            setStartDate={handleStartDateChange}
            endDate={endDate}
            setEndDate={handleEndDateChange}
            searchTerm={searchTerm}
            setSearchTerm={handleSearchTermChange}
            filteredMaterials={filteredMaterials}
            handleViewAll={handleViewAll}
          />

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[760px] overflow-y-auto" onScroll={handleScroll}>
                <table className="min-w-full table-auto">
                  <ModifyTableHeader
                    selectedRows={selectedRows}
                    filteredMaterials={pagedMaterials}
                    allChecked={allChecked}
                    isIndeterminate={isIndeterminate}
                    handleSelectAll={handleSelectAll}
                    batchEditMode={batchEditMode}
                    batchEditValue={batchEditValue}
                    setBatchEditValue={setBatchEditValue}
                    handleHeaderClick={handleHeaderClick}
                  />
                  <tbody className="divide-y divide-gray-200">
                    {pagedMaterials.length > 0 ? (
                      pagedMaterials.map((item, idx) => (
                        <ModifyRow
                          key={idx}
                          item={item}
                          idx={idx}
                          editRowIndex={editRowIndex}
                          editedRow={editedRow}
                          selectedRows={selectedRows}
                          handleRowSelect={handleRowSelect}
                          handleInputChange={handleInputChange}
                          handleEditClick={handleEditClick}
                          handleSaveClick={handleSaveClick}
                          handleDeleteClick={handleDeleteClick}
                          handleSplitOutput={handleSplitOutput}
                          setEditRowIndex={setEditRowIndex}
                          setEditedRow={setEditedRow}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="13" className="text-center p-4 text-gray-500">
                          검색 결과가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <ModifyBatchEdit
              batchEditMode={batchEditMode}
              handleBatchEdit={handleBatchEdit}
            />
          </div>
        </div>
      </div>

      {/* 분할 모달 */}
      {splitTarget && (
        <SplitOutputModal
          isOpen={splitModalOpen}
          onClose={() => {
            setSplitModalOpen(false);
            setSplitTarget(null);
          }}
          onConfirm={handleSplitConfirm}
          originalQuantity={splitTarget.output_quantity}
          originalDate={splitTarget.output_date ? splitTarget.output_date.slice(0, 10) : null}
        />
      )}
    </div>
  );
};

export default Modify;