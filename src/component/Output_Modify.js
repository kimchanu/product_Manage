import React, { useState, useEffect, useCallback } from "react";
import User_info from "./User_info";
import ModifyFilters from "./output_modify/ModifyFilters";
import ModifyTableHeader from "./output_modify/ModifyTableHeader";
import ModifyRow from "./output_modify/ModifyRow";
import ModifyBatchEdit from "./output_modify/ModifyBatchEdit";

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
            material.category?.includes(searchTerm) ||
            material.sub_category?.includes(searchTerm);

          const inDateRange = (!start || outputDate >= start) && (!end || outputDate <= end);

          // 출고 수량이 1 이상인 경우만 필터링
          const hasValidQuantity = output.output_quantity >= 1;

          return matchesSearch && inDateRange && hasValidQuantity;
        })
      : [];
  });

  // 검색/필터가 바뀌면 visibleCount를 20으로 초기화
  useEffect(() => {
    setVisibleCount(20);
    setSelectedRows(new Set()); // 검색/필터/데이터 바뀔 때 체크박스 해제
  }, [searchTerm, startDate, endDate, materials]);

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
          output_quantity: target.output_quantity,
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

    try {
      const updatePromises = rowsToUpdate.map(row => {
        if (!row.output_id) {
          console.error('Missing output_id for row:', row);
          throw new Error('출고 ID가 없습니다.');
        }

        // API 요청 데이터 구성
        const requestData = {
          output_date: batchEditMode === 'date' ? batchEditValue : row.output_date,
          user_id: batchEditMode === 'user' ? batchEditValue : row.output_user,
          comment: batchEditMode === 'comment' ? batchEditValue : row.output_comment,
          material_code: batchEditMode === 'material_code' ? batchEditValue : row.material_code,
          name: batchEditMode === 'name' ? batchEditValue : row.name,
          specification: batchEditMode === 'specification' ? batchEditValue : row.specification,
          price: batchEditMode === 'price' ? Number(batchEditValue) : row.price,
          output_quantity: batchEditMode === 'output_quantity' ? Number(batchEditValue) : row.output_quantity,
          business_location: user?.business_location,
          department: user?.department
        };

        console.log('Sending update request for row:', row.output_id, 'with data:', requestData);

        return fetch(`${process.env.REACT_APP_API_URL}/api/materials/output/${row.output_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(requestData)
        }).then(async response => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '서버 응답을 파싱할 수 없습니다.' }));
            throw new Error(errorData.message || '수정 실패');
          }
          return response.json();
        });
      });

      const results = await Promise.all(updatePromises);
      console.log('Update results:', results);

      alert("일괄 수정이 완료되었습니다.");

      // 데이터 새로고침
      fetchData();

      // 일괄 수정 모드 초기화
      setBatchEditMode(null);
      setBatchEditValue("");
      setSelectedRows(new Set());
    } catch (err) {
      console.error("일괄 수정 중 오류 발생:", err);
      alert(`일괄 수정 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  return (
    <div>
      <User_info setUser={setUser} />
      <div className="p-4 max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">출고 현황</h1>
        <ModifyFilters
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredMaterials={filteredMaterials}
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
  );
};

export default Modify;