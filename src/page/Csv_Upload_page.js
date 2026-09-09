import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Sidebar from "../layout/Side_Bar";
import React, { useEffect, useMemo, useState } from "react";
import Search_select from "../component/Selector/Search_select";
import ExcelUpload from "../component/Excel/ExcelUpload";
import { jwtDecode } from "jwt-decode";

function Csv_Upload() {
  const currentYear = new Date().getFullYear();
  const selectableYears = useMemo(
    () => Array.from({ length: 16 }, (_, index) => currentYear + 1 - index),
    [currentYear]
  );

  const [businessLocation, setBusinessLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [csvData, setCsvData] = useState([]);
  const [username, setUsername] = useState("");
  const [uploadInfo, setUploadInfo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadResetKey, setUploadResetKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const locationMap = {
      GK사업소: "GK",
      천마사업소: "CM",
      을숙도사업소: "ES",
      수원사업소: "수원사업소",
      강남사업소: "강남사업소",
    };

    if (!token) {
      console.warn("토큰이 없습니다. 로그인 상태를 확인하세요.");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setUsername(decodedToken.full_name || "");

      if (decodedToken.business_location) {
        setBusinessLocation(locationMap[decodedToken.business_location] || decodedToken.business_location);
      }
      if (decodedToken.department) setDepartment(decodedToken.department);
    } catch (error) {
      console.error("토큰 디코딩 오류:", error);
    }
  }, []);

  const handleYearChange = (event) => {
    setSelectedYear(Number(event.target.value));
  };

  const handleDetectedYear = (detectedYear) => {
    if (detectedYear && selectableYears.includes(detectedYear)) {
      setSelectedYear(detectedYear);
    }
  };

  const resetUploadState = () => {
    setCsvData([]);
    setUploadInfo(null);
    setUploadResetKey((key) => key + 1);
  };

  const handleSave = async () => {
    if (!businessLocation || !department) {
      alert("사업소와 부서를 선택해주세요.");
      return;
    }

    if (!selectedYear) {
      alert("반영할 기준 연도를 선택해주세요.");
      return;
    }

    if (!csvData || csvData.length === 0) {
      alert("업로드할 엑셀 데이터를 먼저 선택해주세요.");
      return;
    }

    if (!username) {
      alert("사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessLocation,
          department,
          username,
          selectedYear,
          csvData,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const summary = data.summary
          ? `\n자재 ${data.summary.products.toLocaleString()}건, 입고 ${data.summary.inputTransactions.toLocaleString()}건, 출고 ${data.summary.outputTransactions.toLocaleString()}건`
          : "";
        alert(`${data.message || "데이터가 저장되었습니다."}${summary}`);
        resetUploadState();
      } else {
        alert(`오류 발생: ${data.message || "저장에 실패했습니다."}`);
      }
    } catch (error) {
      console.error("업로드 오류:", error);
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalRows = uploadInfo?.rowCount || csvData.length || 0;
  const totalInputs = uploadInfo?.inputTotal || 0;
  const totalOutputs = uploadInfo?.outputTotal || 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600">Excel Upload</p>
                  <h1 className="mt-1 text-2xl font-bold text-slate-900">자재 원시데이터 업로드</h1>
                  <p className="mt-2 text-sm text-slate-500">
                    이월 누계는 전년도 12월 31일로, 1~12월 입출고는 선택한 기준 연도의 월말일로 반영됩니다.
                  </p>
                </div>
                <div className="w-full md:w-56">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">기준 연도</label>
                  <select
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {selectableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">반영 대상</h2>
                <p className="mt-1 text-sm text-slate-500">로그인 정보가 있으면 사업소와 부서가 자동 선택됩니다.</p>
                <div className="mt-5">
                  <Search_select
                    setBusinessLocation={setBusinessLocation}
                    setDepartment={setDepartment}
                    defaultBusinessLocation={businessLocation}
                    defaultDepartment={department}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">날짜 반영 규칙</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div className="rounded-xl bg-white p-4">
                    <p className="font-semibold text-slate-900">이월 누계</p>
                    <p className="mt-1">입고/출고 모두 {selectedYear - 1}-12-31 날짜로 저장됩니다.</p>
                  </div>
                  <div className="rounded-xl bg-white p-4">
                    <p className="font-semibold text-slate-900">월별 입출고</p>
                    <p className="mt-1">1월~12월 데이터는 {selectedYear}년 각 월의 마지막 날짜로 저장됩니다.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">파일 선택</h2>
                  <p className="mt-1 text-sm text-slate-500">원시데이터 엑셀(.xlsx/.xls) 또는 기존 CSV 파일을 업로드할 수 있습니다.</p>
                </div>
                {uploadInfo?.fileName && (
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                    {uploadInfo.fileName}
                  </span>
                )}
              </div>

              <div className="mt-5">
                <ExcelUpload
                  key={uploadResetKey}
                  setCsvData={setCsvData}
                  onUploadInfo={setUploadInfo}
                  onDetectedYear={handleDetectedYear}
                />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">자재 행 수</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{totalRows.toLocaleString()}건</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">입고 합계</p>
                <p className="mt-2 text-2xl font-bold text-blue-600">{totalInputs.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">출고 합계</p>
                <p className="mt-2 text-2xl font-bold text-rose-600">{totalOutputs.toLocaleString()}</p>
              </div>
            </section>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetUploadState}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || csvData.length === 0}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSaving ? "저장 중..." : `${selectedYear}년 데이터 저장`}
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Csv_Upload;
