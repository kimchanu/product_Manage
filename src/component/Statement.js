import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DateSelector from "./Selector/DateSelector";
import User_info from "./User_info";
import ExcelStatementReport from "./Excel/ExcelStatementReport";
import YearlyStatement from "./YearlyStatement";

const Statement = () => {
    const today = new Date();
    const [searchParams, setSearchParams] = useSearchParams();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({});
    const [categories, setCategories] = useState([]);
    const [budgetData, setBudgetData] = useState(null);
    const [departmentBudgets, setDepartmentBudgets] = useState({}); // 부서별 예산 데이터
    const [reportType, setReportType] = useState(searchParams.get("type") || "allPartMonthly"); // URL 파라미터에서 초기값 가져오기 (기본값 전파트 월간)

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

                // 전파트 월간보고서인 경우 부서별 예산 조회
                if (reportType === "allPartMonthly") {
                    const userLocation = normalizeLocation(user.business_location);
                    const budgets = {};

                    ["ITS", "시설", "기전"].forEach(dept => {
                        const deptBudget = data.budget?.find(
                            item => {
                                const budgetLocation = normalizeLocation(item.site);
                                return userLocation === budgetLocation && item.department === dept;
                            }
                        );
                        budgets[dept] = deptBudget?.amount || 0;
                    });

                    setDepartmentBudgets(budgets);
                    console.log("부서별 예산:", budgets);
                } else {
                    // 기존 로직: 사용자 부서의 예산만 조회
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
                }
            } catch (err) {
                console.error("예산 조회 오류:", err);
                setBudgetData({ amount: 0 });
                setDepartmentBudgets({});
            }
        };

        fetchBudget();
    }, [user, year, reportType]);

    useEffect(() => {
        const fetchStatistics = async () => {
            if (!user) return;

            // 전파트 월간보고서인 경우
            if (reportType === "allPartMonthly") {
                const selectedCategories = ["ITS", "TCS", "FTMS", "전산", "기타", "시설", "안전", "장비", "시설보수", "조경", "시설_기타", "기전", "전기", "기계", "소방", "기전_기타", "합 계"];
                setCategories(selectedCategories);

                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/statement/all-part-monthly`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            businessLocation: user.business_location,
                            year,
                            month,
                            budget: budgetData?.amount || 0,
                        }),
                    });

                    if (!response.ok) throw new Error("통계 데이터를 가져오지 못했습니다");

                    const data = await response.json();
                    console.log("전파트 월간보고서 데이터:", data);
                    console.log("시설_기타 데이터:", data.byCategory?.["시설_기타"]);
                    console.log("기전_기타 데이터:", data.byCategory?.["기전_기타"]);
                    setStats(data);
                } catch (err) {
                    console.error(err);
                }
                return;
            }

            // 기존 월간보고서 로직
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
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/statement`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        businessLocation: user.business_location,
                        department: user.department,
                        year,
                        month,
                        categories: selectedCategories,
                    }),
                });

                if (!response.ok) throw new Error("통계 데이터를 가져오지 못했습니다");

                const data = await response.json();
                console.log(data);
                setStats(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchStatistics();
    }, [user, year, month, reportType, budgetData]);

    const renderRow = (cat) => {
        // 하위 카테고리 합산 헬퍼 (UI 표시용)
        const sumOf = (keys = []) => {
            return keys.reduce((acc, key) => {
                const src = stats.byCategory?.[key] || { prevStock: 0, input: 0, output: 0, remaining: 0 };
                return {
                    prevStock: acc.prevStock + (src.prevStock || 0),
                    input: acc.input + (src.input || 0),
                    output: acc.output + (src.output || 0),
                    remaining: acc.remaining + (src.remaining || 0),
                };
            }, { prevStock: 0, input: 0, output: 0, remaining: 0 });
        };

        // 전파트 월간보고서에서만 메인 카테고리를 하위 카테고리 합으로 표시
        const isAllPart = reportType === "allPartMonthly";
        let row;
        if (isAllPart && cat === "ITS") {
            row = sumOf(["TCS", "FTMS", "전산", "기타"]);
        } else if (isAllPart && cat === "시설") {
            row = sumOf(["안전", "장비", "시설보수", "조경", "시설_기타"]);
        } else if (isAllPart && cat === "기전") {
            row = sumOf(["전기", "기계", "소방", "기전_기타"]);
        } else {
            // 시설_기타, 기전_기타는 서버에서 올바른 키로 전달됨
            row = stats.byCategory?.[cat] || { prevStock: 0, input: 0, output: 0, remaining: 0 };
            // 디버깅: 기타 카테고리 값 확인
            if (cat === "시설_기타" || cat === "기전_기타") {
                console.log(`[${cat}] 원본 데이터:`, stats.byCategory?.[cat], "row:", row);
            }
        }

        // 표시 이름 결정: 시설_기타, 기전_기타는 "기타"로 표시
        const displayName = (cat === "시설_기타" || cat === "기전_기타") ? "기타" : cat;

        // 메인 합계 행(ITS/시설/기전)에 연한 빨간 배경색 표시
        const isMainRow = reportType === "allPartMonthly" && ["ITS", "시설", "기전"].includes(cat);
        const bgClass = isMainRow ? "bg-red-100" : "";
        const fontClass = isMainRow ? "font-bold" : "";
        const borderClass = "border border-black";

        return (
            <tr key={cat}>
                <td className={`${borderClass} ${bgClass} ${fontClass} h-12`} colSpan={5}>{displayName}</td>
                <td className={`${borderClass} ${bgClass} ${fontClass} h-12 text-right pr-2`} colSpan={9}>{row.prevStock.toLocaleString()}</td>
                <td className={`${borderClass} ${bgClass} ${fontClass} h-12 text-right pr-2`} colSpan={8}>{row.input.toLocaleString()}</td>
                <td className={`${borderClass} ${bgClass} ${fontClass} h-12 text-right pr-2`} colSpan={8}>{row.output.toLocaleString()}</td>
                <td className={`${borderClass} ${bgClass} ${fontClass} h-12 text-right pr-2`} colSpan={9}>{row.remaining.toLocaleString()}</td>
                <td className={`${borderClass} ${bgClass} ${fontClass} h-12`} colSpan={3}>&nbsp;</td>
            </tr>
        );
    };

    // 보고서 유형에 따라 다른 컴포넌트 렌더링
    // 연간보고서는 YearlyStatement 컴포넌트로 처리
    if (reportType === "partYearly" || reportType === "allPartYearly") {
        return <YearlyStatement />;
    }

    // 월간보고서와 전파트 월간보고서는 Statement 컴포넌트에서 처리
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
                        <ExcelStatementReport
                            stats={stats}
                            categories={categories}
                            year={year}
                            month={month}
                            user={user}
                            budgetAmount={budgetData?.amount || 0}
                            currentMonthAmount={stats.byCategory?.["합 계"]?.input || 0}
                            yearTotalInputAmount={stats.yearTotalInputAmount || 0}
                            remainingAmount={(budgetData?.amount || 0) - (stats.yearTotalInputAmount || 0)}
                            reportType={reportType} // 추가: 보고서 유형 전달
                            departmentBudgets={departmentBudgets} // 전파트 월간보고서용 부서별 예산
                            departmentYearTotalInputAmount={stats.departmentYearTotalInputAmount} // 전파트 월간보고서용 부서별 집행누계
                        />
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-1 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                        >
                            출력하기
                        </button>
                    </div>
                </div>
            </div>

            <div className="print-fit">
                <div className="print-sheet mx-auto">
                    {/* 1. 인쇄용 헤더 (화면에서는 숨김, 인쇄 시에만 한 줄 배치) */}
                    <div className="hidden print:flex relative w-full items-end justify-center mb-10 px-4 min-h-[100px]">
                        <div className="w-full text-center pr-[260px]"> {/* 결재란 자리를 비워주기 위한 패딩 */}
                            <h1 className="large-print-title whitespace-nowrap ">
                                {reportType === "allPartMonthly"
                                    ? `${year}년 ${month.toString().padStart(2, "0")}월 자재수불명세서대장`
                                    : `${year}년 ${month.toString().padStart(2, "0")}월 자재수불명세서대장`}
                            </h1>
                        </div>

                        {/* 결재란 (인쇄 시 우측 하단 고정) */}
                        <div className="absolute right-0 bottom-0">
                            <table className="text-sm text-center border border-black min-w-[200px]">
                                <tbody>
                                    <tr>
                                        <td className="border border-black w-12 h-20" rowSpan={2}>
                                            결<br />재
                                        </td>
                                        <td className="border border-black w-24 h-8">담당</td>
                                        <td className="border border-black w-24 h-8">소장</td>
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
                                {reportType === "allPartMonthly"
                                    ? `${year}년 ${month.toString().padStart(2, "0")}월 자재수불명세서대장`
                                    : `${year}년 ${month.toString().padStart(2, "0")}월 자재수불명세서대장`}
                            </h1>
                        </div>

                        {/* 결재란 */}
                        {/* 결재란 */}
                        <div className="px-4 mb-12">
                            <div className="flex justify-end">
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

                    </div>

                    {/* 문서 정보 */}
                    <table className="table-fixed border border-black text-sm text-center mb-16 print-margin-doc w-full doc-info-table">
                        <tbody>
                            <tr>
                                <td className="border border-black h-10 w-1/4">문서번호</td>
                                <td className="border border-black h-10 w-1/4">GK-{year.toString().slice(2)}-C-003</td>
                                <td className="border border-black h-10 w-1/4">작성일자</td>
                                <td className="border border-black h-10 w-1/4">{year}.{month.toString().padStart(2, "0")}</td>
                            </tr>
                            <tr>
                                <td className="border border-black h-10 w-1/4">부서명</td>
                                <td className="border border-black h-10 w-1/4">{reportType === "allPartMonthly" ? "전체" : (user?.department || '\u00A0')}</td>
                                <td className="border border-black h-10 w-1/4">작성자</td>
                                <td className="border border-black h-10 w-1/4">{user?.name || '\u00A0'}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* 자재수불명세서 표 */}
                    <table className="border border-black text-sm text-center table-fixed w-full statement-table">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black" colSpan={5}>구 분</th>
                                <th className="border border-black" colSpan={9}>전월재고</th>
                                <th className="border border-black" colSpan={8}>입 고</th>
                                <th className="border border-black" colSpan={8}>출 고</th>
                                <th className="border border-black" colSpan={9}>재 고</th>
                                <th className="border border-black" colSpan={3}>비 고</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => renderRow(cat))}
                        </tbody>
                    </table>

                    {/* 예산집행 현황 */}
                    <div className="flex items-baseline justify-between mt-6 mb-2">
                        <h1 className="text-left font-semibold text-base">
                            {year}년 예산집행 현황
                        </h1>
                        <div className="text-right text-sm whitespace-nowrap">
                            (단위 : 원)
                        </div>
                    </div>



                    <table className="border border-black text-sm text-center table-fixed mb-20 w-full budget-table">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black" colSpan={3}>구 분</th>
                                <th className="border border-black" colSpan={9}>예 산</th>
                                <th className="border border-black" colSpan={8}>당월집행 금액</th>
                                <th className="border border-black" colSpan={8}>집행누계 금액</th>
                                <th className="border border-black" colSpan={9}>잔 액</th>
                                <th className="border border-black" colSpan={4}>집행률</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportType === "allPartMonthly" ? (
                                // 전파트 월간보고서: 부서별로 행 표시
                                <>
                                    {["ITS", "시설", "기전"].map((dept) => {
                                        const deptBudget = departmentBudgets[dept] || 0;
                                        const deptMonthInput = stats.byCategory?.[dept]?.input || 0;
                                        const deptYearTotalInput = stats.departmentYearTotalInputAmount?.[dept] || 0;
                                        const deptRemaining = deptBudget - deptYearTotalInput;
                                        const executionRate = deptBudget > 0 ? ((deptYearTotalInput / deptBudget) * 100).toFixed(1) : 0;

                                        return (
                                            <tr key={dept}>
                                                <td className="border border-black h-12" colSpan={3}>{dept}</td>
                                                <td className="border border-black h-12 text-right pr-2" colSpan={9}>{deptBudget.toLocaleString()}</td>
                                                <td className="border border-black h-12 text-right pr-2" colSpan={8}>{deptMonthInput.toLocaleString()}</td>
                                                <td className="border border-black h-12 text-right pr-2" colSpan={8}>{deptYearTotalInput.toLocaleString()}</td>
                                                <td className="border border-black h-12 font-bold text-right pr-2" colSpan={9}>{deptRemaining.toLocaleString()}</td>
                                                <td className="border border-black h-12 font-bold text-base" colSpan={4}>{executionRate}%</td>
                                            </tr>
                                        );
                                    })}
                                </>
                            ) : (
                                // 일반 월간보고서: 월별로 행 표시
                                <tr>
                                    <td className="border border-black h-12" colSpan={3}>
                                        {month.toString().padStart(2, "0")}월
                                    </td>
                                    <td className="border border-black h-12 text-right pr-2" colSpan={9}>{budgetData?.amount?.toLocaleString() || 0}</td>
                                    <td className="border border-black h-12 text-right pr-2" colSpan={8}>{(stats.byCategory?.["합 계"]?.input || 0).toLocaleString()}</td>
                                    <td className="border border-black h-12 text-right pr-2" colSpan={8}>{(stats.yearTotalInputAmount || 0).toLocaleString()}</td>
                                    <td className="border border-black h-12 font-bold text-right pr-2" colSpan={9}>{((budgetData?.amount || 0) - (stats.yearTotalInputAmount || 0)).toLocaleString()}</td>
                                    <td className="border border-black h-12 font-bold text-base" colSpan={4}>
                                        {budgetData?.amount > 0
                                            ? (((stats.yearTotalInputAmount || 0) / budgetData.amount) * 100).toFixed(1)
                                            : 0}%
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Statement;