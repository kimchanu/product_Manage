import React, { useState, useEffect, useCallback } from "react";
import User_info from "../User_info";
import useInputModifyData from "./useInputModifyData";
import InputModifyToolbar from "./InputModifyToolbar";
import InputModifyTable from "./InputModifyTable";
import { FaFilter } from "react-icons/fa";

const InputModify = () => {
    const [user, setUser] = useState(null); // user를 가장 먼저 선언
    // 커스텀 훅으로 데이터/필터 상태 관리
    const {
        materials,
        setMaterials,
        searchTerm,
        setSearchTerm,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        fetchData,
        filteredMaterials
    } = useInputModifyData(user);

    const [showMaterialCodeFilter, setShowMaterialCodeFilter] = useState(false);
    const [materialCodeFilter, setMaterialCodeFilter] = useState("");

    // finalFilteredMaterials를 materialCodeFilter 선언 이후에 선언
    const finalFilteredMaterials = materialCodeFilter
        ? filteredMaterials.filter(item => item.material_code === materialCodeFilter)
        : filteredMaterials;

    const [editRowIndex, setEditRowIndex] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [batchEditMode, setBatchEditMode] = useState(null);
    const [batchEditValue, setBatchEditValue] = useState("");
    const [selectedRows, setSelectedRows] = useState(new Set());
    // 무한 스크롤: 보여줄 자재 개수 상태
    const [visibleCount, setVisibleCount] = useState(20);

    // 검색/필터/데이터 바뀔 때 visibleCount, 체크박스 초기화
    useEffect(() => {
        setVisibleCount(20);
        setSelectedRows(new Set());
    }, [searchTerm, startDate, endDate, materialCodeFilter, materials]);

    // 무한 스크롤 핸들러
    const handleScroll = useCallback((e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
            setVisibleCount((prev) => Math.min(prev + 20, finalFilteredMaterials.length));
        }
    }, [finalFilteredMaterials.length]);

    // 보여줄 데이터
    const pagedMaterials = finalFilteredMaterials.slice(0, visibleCount);

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

    // 행 수정 관련 함수
    const handleEditClick = (index) => {
        setEditRowIndex(index);
        const currentRow = finalFilteredMaterials[index];
        setEditedRow({
            input_date: currentRow.input_date || new Date().toISOString().split('T')[0],
            input_user: currentRow.input_user || '-',
            input_comment: currentRow.input_comment || '-',
        });
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedRow((prev) => ({ ...prev, [name]: value }));
    };
    const handleSaveClick = async (index) => {
        const target = finalFilteredMaterials[index];
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/materials/input/${target.material_id}/${target.input_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input_date: editedRow.input_date || target.input_date,
                    user_id: editedRow.input_user || target.input_user,
                    comment: editedRow.input_comment || target.input_comment,
                    input_quantity: target.input_quantity,
                    business_location: user.business_location,
                    department: user.department,
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
            fetchData();
        } catch (error) {
            console.error('수정 중 오류 발생:', error);
            alert(error.message);
        }
    };
    // 삭제
    const handleDeleteClick = async (index) => {
        const target = finalFilteredMaterials[index];
        if (!window.confirm('정말로 이 입고 기록을 삭제하시겠습니까?')) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/materials/input/${target.material_id}/${target.input_id}`, {
                body: JSON.stringify({
                    business_location: user?.business_location,
                    department: user?.department
                }),
                headers: { 'Content-Type': 'application/json' },
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '삭제 중 오류가 발생했습니다.');
            }
            const result = await response.json();
            alert(result.message);
            fetchData();
        } catch (error) {
            console.error('삭제 중 오류 발생:', error);
            alert(error.message);
        }
    };
    // 체크박스
    const handleRowSelect = (idx) => {
        const newSelectedRows = new Set(selectedRows);
        if (newSelectedRows.has(idx)) {
            newSelectedRows.delete(idx);
        } else {
            newSelectedRows.add(idx);
        }
        setSelectedRows(newSelectedRows);
    };
    // 일괄수정
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
        const rowsToUpdate = finalFilteredMaterials.filter((_, idx) => selectedRows.has(idx));
        if (rowsToUpdate.length === 0) {
            alert("수정할 행을 선택해주세요.");
            return;
        }
        try {
            const updatePromises = rowsToUpdate.map(row => {
                if (!row.input_id) throw new Error('입고 ID가 없습니다.');
                const requestData = {
                    input_date: batchEditMode === 'date' ? batchEditValue : row.input_date,
                    user_id: batchEditMode === 'user' ? batchEditValue : row.input_user,
                    comment: batchEditMode === 'comment' ? batchEditValue : row.input_comment,
                    input_quantity: batchEditMode === 'input_quantity' ? Number(batchEditValue) : row.input_quantity,
                    business_location: user?.business_location,
                    department: user?.department
                };
                return fetch(`${process.env.REACT_APP_API_URL}/api/materials/input/${row.material_id}/${row.input_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData)
                }).then(async response => {
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: '서버 응답을 파싱할 수 없습니다.' }));
                        throw new Error(errorData.message || '수정 실패');
                    }
                    return response.json();
                });
            });
            await Promise.all(updatePromises);
            alert("일괄 수정이 완료되었습니다.");
            fetchData();
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
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">입고 현황</h1>
                <div style={{ width: '70%', margin: '0 auto' }}>
                    <InputModifyToolbar
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filteredMaterials={finalFilteredMaterials}
                    />
                    <InputModifyTable
                    filteredMaterials={pagedMaterials}
                    allChecked={allChecked}
                    isIndeterminate={isIndeterminate}
                    handleSelectAll={handleSelectAll}
                    handleScroll={handleScroll}
                    allMaterialsForFilter={filteredMaterials}
                    selectedRows={selectedRows}
                    handleRowSelect={handleRowSelect}
                    editRowIndex={editRowIndex}
                    editedRow={editedRow}
                    handleEditClick={handleEditClick}
                    handleInputChange={handleInputChange}
                    handleSaveClick={handleSaveClick}
                    handleDeleteClick={handleDeleteClick}
                    batchEditMode={batchEditMode}
                    batchEditValue={batchEditValue}
                    setBatchEditValue={setBatchEditValue}
                    handleHeaderClick={handleHeaderClick}
                    handleBatchEdit={handleBatchEdit}
                    setEditRowIndex={setEditRowIndex}
                    setEditedRow={setEditedRow}
                    showMaterialCodeFilter={showMaterialCodeFilter}
                    setShowMaterialCodeFilter={setShowMaterialCodeFilter}
                    setMaterialCodeFilter={setMaterialCodeFilter}
                    />
                </div>
            </div>
        </div>
    );
};

export default InputModify; 