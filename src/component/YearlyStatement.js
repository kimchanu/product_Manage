import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DateSelector from "./Selector/DateSelector";
import User_info from "./User_info";
import ExcelYearlyStatementReport from "./Excel/ExcelYearlyStatementReport";

const YearlyStatement = () => {
    const landscapePrintStyle = `
@page {
  size: A4 landscape;
  margin: 6mm;
}

@media print {
  /* ✅ (중요) 전역에서 mm로 고정된 height/overflow를 '해제'해야 빈 페이지가 사라지는 경우가 많음 */
  html, body {
    width: auto !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  /* 가운데 정렬 */
  body {
    background: #fff !important;
    display: flex !important;
    justify-content: center !important;
    align-items: flex-start !important;
  }

  .no-print { display: none !important; }

  .print-root {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* ✅ 스케일/줌으로 맞추기보다, 컨텐츠 폭을 “페이지 안”으로 맞추는 게 안정적 */
  .print-sheet {
    width: 285mm !important;   /* 297 - (좌우 margin 6mm*2) = 285mm */
    margin: 0 auto !important;
    padding: 0 !important;
  }

  /* transform/zoom은 브라우저에 따라 가짜 페이지 만들 때가 있어서 off */
  .print-fit {
    transform: none !important;
    zoom: 1 !important;
  }

  /* ✅ Yearly는 가로 2표를 반드시 한 줄 */
  .yearly-landscape .flex {
    flex-direction: row !important;
    gap: 6mm !important;
  }

  /* ✅ “딱 1~2px 넘침”으로 2페이지 생기는 걸 막기 위해 여백을 강제로 줄임 */
  .mb-20, .mb-16, .mb-12, .mb-10, .mb-8, .mb-6 { margin-bottom: 0 !important; }
  .mt-10 { margin-top: 4px !important; }
  .mt-6 { margin-top: 4px !important; }

  /* ✅ 전역에서 table/tr에 걸어둔 page-break-inside: avoid가 ‘빈 페이지’ 원인이 되기도 함
     → Yearly 출력에 한해 완화 */
  table {
  border-collapse: collapse !important;
  border-spacing: 0 !important;
}
  th, td {
  border-width: 1px !important;
}

  /* 혹시 마지막 요소가 break를 유발하면 방지 */
  .print-sheet { page-break-after: auto !important; break-after: auto !important; }
}
  .print-title-wrapper {
  margin-bottom: 8mm !important; /* 원하는 만큼 6~12mm로 조절 */
}
  .print-margin-doc {
  margin-bottom: 5mm !important; /* 8~14mm 사이로 취향 조절 */
}
  .yearly-total-row td {
  height: 28px !important;     /* 기존 22~24px → 살짝만 증가 */
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}
`;


    const today = new Date();
    const [searchParams, setSearchParams] = useSearchParams();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({});
    const [categories, setCategories] = useState([]);
    const [budgetData, setBudgetData] = useState(null);
    const [reportType, setReportType] = useState(searchParams.get("type") || "partYearly");

    useEffect(() => {
        const fetchBudget = async () => {
            if (!user) return;

            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/budget?year=${year}`);
                if (!response.ok) throw new Error("예산 조회 실패");
                const data = await response.json();
                console.log(data);

                // business_location 정규화 함수
                const normalizeLocation = (location) => {
                    if (!location) return '';
                    const normalized = location.toLowerCase().replace(/사업소/g, '').trim();
                    return normalized;
                };

                const departmentBudget = data.budget?.find(
                    item => {
                        const userLocation = normalizeLocation(user.business_location);
                        const budgetLocation = normalizeLocation(item.site);
                        return userLocation === budgetLocation && item.department === user.department;
                    }
                );

                console.log("사용자 정보:", { business_location: user.business_location, department: user.department });
                console.log("정규화된 위치:", normalizeLocation(user.business_location));
                console.log("매칭된 예산:", departmentBudget);

                setBudgetData(departmentBudget || { amount: 0 });
            } catch (err) {
                console.error("예산 조회 오류:", err);
                setBudgetData({ amount: 0 });
            }
        };

        fetchBudget();
    }, [user, year]);

    useEffect(() => {
        const fetchStatistics = async () => {
            if (!user) return;

            let selectedCategories = [];

            if (user.department === "ITS") {
                selectedCategories = ["TCS", "FTMS", "전산", "기타", "합 계"];
            } else if (user.department === "기전") {
                selectedCategories = ["전기", "기계", "소방", "기타", "합 계"];
            } else if (user.department === "시설") {
                selectedCategories = ["안전", "장비", "시설보수", "조경", "기타", "합 계"];
            }
            setCategories(selectedCategories);
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/yearlyStatement`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        businessLocation: user.business_location,
                        department: user.department,
                        year,
                        categories: selectedCategories,
                    }),
                });

                if (!response.ok) throw new Error("통계 데이터를 가져오지 못했습니다");

                const data = await response.json();
                console.log("연간 데이터:", data);
                setStats(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchStatistics();
    }, [user, year]);

    // 실제 API 데이터 사용
    const monthlyData = stats.monthlyData || {};

    const renderYearlyTables = () => {
        // Statement와 동일한 방식으로 누적 재고 계산
        // 전년도 말일까지의 재고를 시작점으로 사용
        let cumulativeStock = 0;

        // 전년도 말일까지의 재고 계산 (API에서 이미 계산된 remaining 값 사용)
        if (stats.yearlyTotals) {
            categories.forEach(cat => {
                if (cat !== "합 계") {
                    // 첫 번째 월(1월)의 remaining 값을 시작점으로 사용
                    const firstMonthData = monthlyData[1]?.[cat] || { input: 0, output: 0, remaining: 0 };
                    // 1월의 remaining에서 1월의 입고를 빼면 전년도 말일까지의 재고
                    const prevYearStock = firstMonthData.remaining - firstMonthData.input;
                    cumulativeStock += prevYearStock;
                }
            });
        }

        // 1~6월 데이터 (전체 카테고리 합계)
        const firstHalfData = [];
        for (let month = 1; month <= 6; month++) {
            let totalInput = 0;
            let totalOutput = 0;

            // 모든 카테고리의 해당 월 데이터 합계
            categories.forEach(cat => {
                if (cat !== "합 계") {
                    const monthData = monthlyData[month]?.[cat] || { input: 0, output: 0, remaining: 0 };
                    totalInput += monthData.input;
                    totalOutput += monthData.output;
                }
            });

            // 누적 재고 계산: 이전 재고 + 입고 - 출고
            cumulativeStock = cumulativeStock + totalInput - totalOutput;

            console.log(`${month}월 - 입고: ${totalInput}, 출고: ${totalOutput}, 누적재고: ${cumulativeStock}`);

            firstHalfData.push({
                month,
                input: totalInput,
                output: totalOutput,
                stock: cumulativeStock  // 누적 재고
            });
        }

        // 7~12월 데이터 (전체 카테고리 합계)
        const secondHalfData = [];
        for (let month = 7; month <= 12; month++) {
            let totalInput = 0;
            let totalOutput = 0;

            // 모든 카테고리의 해당 월 데이터 합계
            categories.forEach(cat => {
                if (cat !== "합 계") {
                    const monthData = monthlyData[month]?.[cat] || { input: 0, output: 0, remaining: 0 };
                    totalInput += monthData.input;
                    totalOutput += monthData.output;
                }
            });

            // 누적 재고 계산: 이전 재고 + 입고 - 출고
            cumulativeStock = cumulativeStock + totalInput - totalOutput;

            console.log(`${month}월 - 입고: ${totalInput}, 출고: ${totalOutput}, 누적재고: ${cumulativeStock}`);

            secondHalfData.push({
                month,
                input: totalInput,
                output: totalOutput,
                stock: cumulativeStock  // 누적 재고
            });
        }

        // 총합계 계산
        const totalInput = firstHalfData.reduce((sum, data) => sum + data.input, 0) +
            secondHalfData.reduce((sum, data) => sum + data.input, 0);
        const totalOutput = firstHalfData.reduce((sum, data) => sum + data.output, 0) +
            secondHalfData.reduce((sum, data) => sum + data.output, 0);
        // 총합계 재고는 12월 말일의 누적 재고값 사용
        const totalStock = secondHalfData.length > 0 ? secondHalfData[secondHalfData.length - 1].stock : 0;

        // 전역 변수로 설정하여 다른 곳에서 사용할 수 있도록 함
        window.yearlyTotalOutput = totalOutput;
        window.yearlyTotalInput = totalInput;

        return (
            <div className="mb-8 print-root yearly-landscape">
                {/* 가로로 2개 표 배치 */}
                <div className="flex gap-8 mb-6">
                    {/* 1~6월 표 */}
                    <div className="flex-1">
                        <table className="w-full border border-black text-sm text-center table-fixed yearly-total-row">
                            <thead>
                                <tr className="bg-gray-100 double-underline yearly-total-row">
                                    <th className="border border-black h-10">월</th>
                                    <th className="border border-black h-10">입고</th>
                                    <th className="border border-black h-10">출고</th>
                                    <th className="border border-black h-10">재고</th>
                                </tr>
                            </thead>
                            <tbody>
                                {firstHalfData.map((data) => {
                                    console.log(`[UI 렌더링] ${data.month}월 - 입고: ${data.input}, 출고: ${data.output}, 재고: ${data.stock}`);
                                    return (
                                        <tr key={data.month}>
                                            <td className="border border-black h-10">{data.month}월</td>
                                            <td className="border border-black text-right pr-2 h-10">{data.input.toLocaleString()}</td>
                                            <td className="border border-black text-right pr-2 h-10">{data.output.toLocaleString()}</td>
                                            <td className="border border-black text-right pr-2 h-10">{data.stock.toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* 7~12월 표 + 총합계 */}
                    <div className="flex-1">
                        <table className="w-full border border-black text-sm text-center table-fixed yearly-total-row">
                            <thead>
                                <tr className="bg-gray-100 double-underline">
                                    <th className="border border-black h-10">월</th>
                                    <th className="border border-black h-10">입고</th>
                                    <th className="border border-black h-10">출고</th>
                                    <th className="border border-black h-10">재고</th>
                                </tr>
                            </thead>
                            <tbody>
                                {secondHalfData.map((data) => (
                                    <tr key={data.month}>
                                        <td className="border border-black h-10">{data.month}월</td>
                                        <td className="border border-black text-right pr-2 h-10">{data.input.toLocaleString()}</td>
                                        <td className="border border-black text-right pr-2 h-10">{data.output.toLocaleString()}</td>
                                        <td className="border border-black text-right pr-2 h-10">{data.stock.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {/* 총합계 행을 7~12월 표 아래에 추가 */}
                                <tr className="bg-blue-100 yearly-total-row">
                                    <td className="border border-black h-10 font-bold">총합계</td>
                                    <td className="border border-black text-right pr-2 h-10 font-bold">{totalInput.toLocaleString()}</td>
                                    <td className="border border-black text-right pr-2 h-10 font-bold">{totalOutput.toLocaleString()}</td>
                                    <td className="border border-black text-right pr-2 h-10 font-bold">{totalStock.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 print-root">
            <div className="no-print mx-20">
                <User_info setUser={setUser} />
                <div className="flex justify-end mb-2">
                    <div className="flex items-center gap-4">
                        {/* 보고서 유형 선택 셀렉션 */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="reportType" className="text-sm font-medium text-gray-700">
                                보고서 유형:
                            </label>
                            <select
                                id="reportType"
                                value={reportType}
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    setReportType(newType);
                                    setSearchParams({ type: newType }); // URL 파라미터 업데이트

                                    // 월간보고서 또는 전파트 월간보고서 선택 시 페이지 새로고침하여 Statement 컴포넌트로 이동
                                    if (newType === "monthly" || newType === "allPartMonthly") {
                                        window.location.reload();
                                    }
                                }}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="allPartMonthly">전파트 월간보고서</option>
                                <option value="monthly">월간보고서</option>
                                <option value="partYearly">파트별 연간보고서</option>
                            </select>
                        </div>

                        <DateSelector
                            year={year}
                            month={month}
                            onYearChange={setYear}
                            onMonthChange={setMonth}
                        />
                        <ExcelYearlyStatementReport
                            stats={stats}
                            categories={categories}
                            year={year}
                            month={month}
                            user={user}
                            budgetAmount={budgetData?.amount || 0}
                            currentMonthAmount={stats.yearlyTotals?.["합 계"]?.input || 0}
                            yearTotalInputAmount={stats.yearlyTotals?.["합 계"]?.input || 0}
                            remainingAmount={(budgetData?.amount || 0) - (stats.yearlyTotals?.["합 계"]?.output || 0)}
                            reportType={reportType}
                        />
                        <button
                            onClick={() => {
                                const style = document.createElement("style");
                                style.id = "landscape-print-style";
                                style.innerHTML = landscapePrintStyle;
                                document.head.appendChild(style);

                                const cleanup = () => {
                                    const el = document.getElementById("landscape-print-style");
                                    if (el) el.remove();
                                    window.removeEventListener("afterprint", cleanup);
                                };

                                window.addEventListener("afterprint", cleanup);
                                window.print();
                            }}
                            className="px-4 py-1 bg-green-600 text-white rounded-md text-sm font-medium"
                        >
                            출력하기
                        </button>

                    </div>
                </div>
            </div>

            <div className="print-fit">
                <div className="print-sheet mx-auto">
                    {/* 1. 인쇄용 헤더 (화면에서는 숨김, 인쇄 시에만 한 줄 배치) */}
                    <div className="hidden print:flex print-title-wrapper relative w-full items-end justify-center mb-10 px-4 min-h-[100px]">
                        <div className="w-full text-center pr-[260px]">
                            <h1 className="large-print-title whitespace-nowrap">
                                {year}년 {user?.department} 연간보고서
                            </h1>
                        </div>

                        {/* 결재란 (인쇄 시 우측 하단 고정) */}
                        <div className="absolute right-0 bottom-0">
                            <table className="text-sm text-center border border-black min-w-[240px]">
                                <tbody>
                                    <tr>
                                        <td className="border border-black w-12 h-20" rowSpan={2}>결<br />재</td>
                                        <td className="border border-black w-20 h-8">담당</td>
                                        <td className="border border-black w-20 h-8">소장</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black print-signature-cell"></td>
                                        <td className="border border-black print-signature-cell"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 2. 화면용 헤더 (인쇄 시 숨김, 기존 레이아웃 유지) */}
                    <div className="print:hidden">
                        <div className="flex items-center justify-center gap-4 mb-6 px-4">
                            <h1 className="text-xl font-bold whitespace-nowrap text-center">
                                {year}년 {user?.department} 연간보고서
                            </h1>
                        </div>

                        {/* 결재란 */}
                        <div className="flex justify-end mb-6 px-4">
                            <table className="text-sm text-center border border-black">
                                <tbody>
                                    <tr>
                                        <td className="border border-black w-16 h-16" rowSpan={2}>
                                            결<br />재
                                        </td>
                                        <td className="border border-black w-24 h-8">담당</td>
                                        <td className="border border-black w-24 h-8">소장</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black h-8"></td>
                                        <td className="border border-black h-8"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>

                    {/* 문서 정보 */}
                    <table className="table-fixed border border-black text-sm text-center mb-16 print-margin-doc w-full doc-info-table">
                        <tbody>
                            <tr>
                                <td className="border border-black h-10 w-1/4">문서번호</td>
                                <td className="border border-black h-10 w-1/4">GK-{year.toString().slice(2)}-C-004</td>
                                <td className="border border-black h-10 w-1/4">작성일자</td>
                                <td className="border border-black h-10 w-1/4">{year}.12</td>
                            </tr>
                            <tr>
                                <td className="border border-black h-10 w-1/4">부서명</td>
                                <td className="border border-black h-10 w-1/4">{user?.department || '\u00A0'}</td>
                                <td className="border border-black h-10 w-1/4">작성자</td>
                                <td className="border border-black h-10 w-1/4">{user?.name || '\u00A0'}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* 연간 자재수불명세서 표 */}
                    <div className="text-right text-sm mb-2">(단위 : 원)</div>

                    {/* 연간 테이블들 */}
                    {renderYearlyTables()}

                    {/* 연간 예산집행 현황 */}
                    <div className="flex items-baseline justify-between mt-6 mb-2">
                        <h1 className="text-left font-semibold text-base">
                            {year}년 예산집행 현황
                        </h1>
                        <div className="text-right text-sm whitespace-nowrap">
                            (단위 : 원)
                        </div>
                    </div>


                    <table className="w-full border border-black text-sm text-center table-fixed">
                        <thead>
                            <tr className="bg-gray-100 double-underline yearly-total-row">
                                <th className="border border-black" colSpan={3}>구 분</th>
                                <th className="border border-black" colSpan={9}>예 산</th>
                                <th className="border border-black" colSpan={8}>연간집행 금액</th>
                                <th className="border border-black" colSpan={9}>잔 액</th>
                                <th className="border border-black" colSpan={5}>집행률</th>
                                <th className="border border-black" colSpan={4}>비 고</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black h-12" colSpan={3}>
                                    {user?.department}
                                </td>
                                <td className="border border-black text-right pr-2 h-12" colSpan={9}>{budgetData?.amount?.toLocaleString() || 0}</td>
                                <td className="border border-black text-right pr-2 h-12" colSpan={8}>{(window.yearlyTotalInput || 0).toLocaleString()}</td>

                                <td className="border border-black text-right pr-2 h-12" colSpan={9}>{((budgetData?.amount || 0) - (window.yearlyTotalInput || 0)).toLocaleString()}</td>
                                <td className="border border-black h-12" colSpan={5}>
                                    {budgetData?.amount ?
                                        `${(((window.yearlyTotalInput || 0) / budgetData.amount) * 100).toFixed(1)}%` :
                                        '0%'
                                    }
                                </td>
                                <td className="border border-black h-12" colSpan={4}>&nbsp;</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default YearlyStatement; 