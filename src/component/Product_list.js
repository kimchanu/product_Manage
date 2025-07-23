import { useState, useEffect, useRef, useCallback } from "react";
import Search_select from "./Selector/Search_select";
import { FaFilter } from "react-icons/fa";
import Product_list_edit from "./Product_list_edit";

function Product_list() {
  const [businessLocation, setBusinessLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [materials, setMaterials] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // ⛑️ 에러 메시지 상태 추가
  const [filters, setFilters] = useState({
    material_code: "",
    location: "",
    big_category: "",
    category: "",
    sub_category: "",
    currentStock: ""
  });
  const [showFilter, setShowFilter] = useState({
    material_code: false,
    location: false,
    big_category: false,
    category: false,
    sub_category: false,
    currentStock: false
  });
  // 체크박스 선택 상태
  const [selectedRows, setSelectedRows] = useState([]); // id 배열
  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // 🔧 이전 사업소/부서 상태 저장
  const prevValues = useRef({ businessLocation: "", department: "" });

  // ✅ 사업소 & 부서가 모두 바뀌었을 때만 서버에 POST 요청
  useEffect(() => {
    const hasBusinessLocationChanged = prevValues.current.businessLocation !== businessLocation;
    const hasDepartmentChanged = prevValues.current.department !== department;

    if (
      businessLocation &&
      department &&
      (hasBusinessLocationChanged || hasDepartmentChanged)
    ) {
      const fetchData = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/materials`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ businessLocation, department }),
          });

          const result = await response.json();

          if (!Array.isArray(result)) {
            throw new Error("자재 데이터가 올바른 형식이 아닙니다.");
          }

          console.log("서버 응답:", result);
          setMaterials(result);
          setErrorMessage(""); // 🔄 에러 초기화
        } catch (error) {
          console.error("서버 요청 오류:", error);
          setMaterials([]); // ❌ 실패 시 비워주기
          setErrorMessage("자재 정보를 불러오는 데 실패했습니다.");
        }
      };

      fetchData();

      prevValues.current = { businessLocation, department };
    }
  }, [businessLocation, department]);

  // ✅ 검색 필터 처리
  const filteredMaterials =
    Array.isArray(materials) &&
    materials.filter(
      (material) =>
        (material?.material_code?.includes(searchTerm) ||
          material?.name?.includes(searchTerm) ||
          material?.category?.includes(searchTerm) ||
          material?.sub_category?.includes(searchTerm)) &&
        (filters.material_code === "" || material?.material_code === filters.material_code) &&
        (filters.location === "" || material?.location === filters.location) &&
        (filters.big_category === "" || material?.big_category === filters.big_category) &&
        (filters.category === "" || material?.category === filters.category) &&
        (filters.sub_category === "" || material?.sub_category === filters.sub_category) &&
        (filters.currentStock === "" ||
          (filters.currentStock === "low" &&
            ((material?.total_input_quantity || 0) - (material?.total_output_quantity || 0)) < (material?.appropriate || 0)) ||
          (filters.currentStock === "normal" &&
            ((material?.total_input_quantity || 0) - (material?.total_output_quantity || 0)) >= (material?.appropriate || 0)))
    );

  // 무한 스크롤: 보여줄 자재 개수 상태
  const [visibleCount, setVisibleCount] = useState(20);

  // 검색/필터가 바뀌면 visibleCount를 20으로 초기화
  useEffect(() => {
    setVisibleCount(20);
    setSelectedRows([]); // 검색/필터/데이터 바뀔 때 체크박스 해제
  }, [searchTerm, filters, materials]);

  // 무한 스크롤 핸들러
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setVisibleCount((prev) => Math.min(prev + 20, filteredMaterials.length));
    }
  }, [filteredMaterials.length]);

  // 보여줄 데이터
  const pagedMaterials = filteredMaterials.slice(0, visibleCount);

  // 전체 체크박스 상태 (pagedMaterials 기준)
  const allChecked = pagedMaterials.length > 0 && pagedMaterials.every(row => selectedRows.includes(row.material_id));
  const isIndeterminate = pagedMaterials.some(row => selectedRows.includes(row.material_id)) && !allChecked;

  // 전체 체크박스 핸들러 (보이는 것만)
  const handleCheckAll = (e) => {
    if (e.target.checked) {
      // 보이는 것만 추가
      const newSelected = Array.from(new Set([...selectedRows, ...pagedMaterials.map(row => row.material_id)]));
      setSelectedRows(newSelected);
    } else {
      // 보이는 것만 해제
      const newSelected = selectedRows.filter(id => !pagedMaterials.some(row => row.material_id === id));
      setSelectedRows(newSelected);
    }
  };
  // 개별 체크박스
  const handleCheckRow = (material_id) => {
    setSelectedRows(prev => prev.includes(material_id) ? prev.filter(i => i !== material_id) : [...prev, material_id]);
  };

  // 일괄 수정 모달 저장
  const handleBatchEdit = async ({ field, value, selectedRows }) => {
    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      // 서버에 일괄 PATCH/PUT 요청 (엔드포인트에 맞게 수정)
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/materials/bulk-update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value, selectedRows, businessLocation, department })
      });
      if (!res.ok) throw new Error("저장 실패");
      setSaveSuccess("일괄 수정이 저장되었습니다.");
      setModalOpen(false);
      setSelectedRows([]);
      // 저장 후 데이터 새로고침
      const refreshed = await fetch(`${process.env.REACT_APP_API_URL}/api/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessLocation, department })
      });
      const refreshedData = await refreshed.json();
      setMaterials(Array.isArray(refreshedData) ? refreshedData : []);
    } catch (e) {
      setSaveError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div>
      <Search_select
        setBusinessLocation={setBusinessLocation}
        setDepartment={setDepartment}
      />
      <div className="p-4 w-4/5 mx-auto">
        {/* 검색창 */}
        <div className="mb-4 flex space-x-4">
          <input
            type="text"
            placeholder="자재코드, 이름, 대분류 또는 소분류 입력"
            className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* 일괄 수정 버튼 */}
        <div className="mb-2 flex gap-2 items-center">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={selectedRows.length === 0 || saveLoading}
            onClick={() => setModalOpen(true)}
          >
            선택 행 일괄 수정
          </button>
          {saveError && <span className="text-red-500 ml-2">{saveError}</span>}
          {saveSuccess && <span className="text-green-600 ml-2">{saveSuccess}</span>}
        </div>
        {/* 테이블 */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-[710px] overflow-y-auto" onScroll={handleScroll}>
            <table className="min-w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr className="border-b border-gray-300">
                  <th className="px-2 py-3 text-sm font-medium text-gray-600 border-r border-gray-200">
                    <input type="checkbox" checked={allChecked} ref={el => { if (el) el.indeterminate = isIndeterminate; }} onChange={handleCheckAll} />
                  </th>
                  {[
                    "자재코드", "위치", "대분류", "중분류", "소분류", "품명",
                    "규격", "제조사", "단위", "단가", "재고수량", "재고금액", "적정수량"
                  ].map((header, idx) => (

                    <th
                      key={idx}
                      className={`px-6 py-3 text-sm font-medium text-gray-600 border-r border-gray-200 ${[9, 10, 11].includes(idx) ? "text-right" : "text-left"
                        }`}
                    >
                      <div className="flex items-center">
                        {header}
                        {["자재코드", "위치", "대분류", "중분류", "소분류", "적정수량"].includes(header) && (
                          <button
                            onClick={() => {
                              const filterKey = {
                                "자재코드": "material_code",
                                "위치": "location",
                                "대분류": "big_category",
                                "중분류": "category",
                                "소분류": "sub_category",
                                "적정수량": "currentStock"
                              }[header];
                              setShowFilter(prev => ({
                                ...prev,
                                [filterKey]: !prev[filterKey]
                              }));
                            }}
                            className="ml-1 text-gray-400 hover:text-gray-600"
                          >
                            <FaFilter size={12} />
                          </button>
                        )}
                      </div>
                      {["자재코드", "위치", "대분류", "중분류", "소분류", "적정수량"].includes(header) && showFilter[{
                        "자재코드": "material_code",
                        "위치": "location",
                        "대분류": "big_category",
                        "중분류": "category",
                        "소분류": "sub_category",
                        "적정수량": "currentStock"
                      }[header]] && (
                          <div className="absolute mt-1 w-40 bg-white shadow-lg rounded-md z-20 border border-gray-200">
                            <div className="p-2 max-h-60 overflow-y-auto">
                              {header !== "적정수량" ? (
                                Array.from(new Set(materials.map(item => item[{
                                  "자재코드": "material_code",
                                  "위치": "location",
                                  "대분류": "big_category",
                                  "중분류": "category",
                                  "소분류": "sub_category"
                                }[header]]))).map((value, i) => (
                                  <div
                                    key={i}
                                    className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      setFilters(prev => ({
                                        ...prev,
                                        [{
                                          "자재코드": "material_code",
                                          "위치": "location",
                                          "대분류": "big_category",
                                          "중분류": "category",
                                          "소분류": "sub_category"
                                        }[header]]: value
                                      }));
                                      setShowFilter(prev => ({
                                        ...prev,
                                        [{
                                          "자재코드": "material_code",
                                          "위치": "location",
                                          "대분류": "big_category",
                                          "중분류": "category",
                                          "소분류": "sub_category"
                                        }[header]]: false
                                      }));
                                    }}
                                  >
                                    {value || "-"}
                                  </div>
                                ))
                              ) : (
                                <>
                                  <div
                                    className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      setFilters(prev => ({
                                        ...prev,
                                        currentStock: "low"
                                      }));
                                      setShowFilter(prev => ({
                                        ...prev,
                                        currentStock: false
                                      }));
                                    }}
                                  >
                                    재고 부족
                                  </div>
                                  <div
                                    className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      setFilters(prev => ({
                                        ...prev,
                                        currentStock: "normal"
                                      }));
                                      setShowFilter(prev => ({
                                        ...prev,
                                        currentStock: false
                                      }));
                                    }}
                                  >
                                    재고 정상
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="border-t border-gray-200 p-1">
                              <button
                                className="text-xs text-blue-500 hover:text-blue-700"
                                onClick={() => {
                                  setFilters(prev => ({
                                    ...prev,
                                    [{
                                      "자재코드": "material_code",
                                      "위치": "location",
                                      "대분류": "big_category",
                                      "중분류": "category",
                                      "소분류": "sub_category",
                                      "적정수량": "currentStock"
                                    }[header]]: ""
                                  }));
                                  setShowFilter(prev => ({
                                    ...prev,
                                    [{
                                      "자재코드": "material_code",
                                      "위치": "location",
                                      "대분류": "big_category",
                                      "중분류": "category",
                                      "소분류": "sub_category",
                                      "적정수량": "currentStock"
                                    }[header]]: false
                                  }));
                                }}
                              >
                                필터 초기화
                              </button>
                            </div>
                          </div>
                        )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedMaterials.length > 0 ? (
                  pagedMaterials.map((material, idx) => {
                    const currentStock =
                      (material?.total_input_quantity || 0) - (material?.total_output_quantity || 0);
                    const appropriate = material?.appropriate || 0;
                    const isLow = currentStock < appropriate;
                    const rowClass = isLow
                      ? "bg-red-300 hover:bg-red-300"
                      : idx % 2 === 0
                        ? "bg-gray-50 hover:bg-gray-100"
                        : "bg-white hover:bg-gray-100";



                    return (
                      <tr key={material.material_id} className={`border-b border-gray-200 ${rowClass}`}>
                        <td className="px-2 py-3 text-center border-r border-gray-200">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(material.material_id)}
                            onChange={() => handleCheckRow(material.material_id)}
                          />
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-left border-r border-gray-200">
                          {material?.material_code || "-"}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-left border-r border-gray-200 max-w-[4em] truncate" title={material?.location || "-"}>
                          {material?.location || "-"}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-left border-r border-gray-200">
                          {material?.big_category || "-"}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-left border-r border-gray-200">
                          {material?.category || "-"}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-left border-r border-gray-200">
                          {material?.sub_category || "-"}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-left border-r border-gray-200">
                          {material?.name || "-"}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-left border-r border-gray-200">
                          {material?.specification || "N/A"}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-left border-r border-gray-200 max-w-[4em] truncate" title={material?.manufacturer || "-"}>
                          {material?.manufacturer || "-"}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-left border-r border-gray-200">
                          {material?.unit || "-"}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-right border-r border-gray-200">
                          {material?.price?.toLocaleString() || "0"}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-right border-r border-gray-200">
                          {currentStock.toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-right border-r border-gray-200">
                          {(currentStock * (material?.price || 0)).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800 text-right border-r border-gray-200">
                          {material?.appropriate?.toLocaleString() || "0"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="14"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </div>
        {/* 일괄 수정 모달 */}
        <Product_list_edit
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          selectedRows={selectedRows}
          onSave={handleBatchEdit}
        />
      </div>
    </div>
  );
}

export default Product_list;