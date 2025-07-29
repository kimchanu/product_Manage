import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DateSelector from "./Selector/DateSelector";
import User_info from "./User_info";
import ExcelYearlyStatementReport from "./Excel/ExcelYearlyStatementReport";

const YearlyStatement = () => {
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
                selectedCategories = ["조경", "시설", "장비", "합 계"];
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
            <div className="mb-8">
                {/* 가로로 2개 표 배치 */}
                <div className="flex gap-8 mb-6">
                    {/* 1~6월 표 */}
                    <div className="flex-1">
                        <table className="w-full border border-black text-sm text-center table-fixed">
                            <thead>
                                <tr className="bg-gray-100">
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
                                            <td className="border border-black h-10">{data.input.toLocaleString()}</td>
                                            <td className="border border-black h-10">{data.output.toLocaleString()}</td>
                                            <td className="border border-black h-10">{data.stock.toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* 7~12월 표 + 총합계 */}
                    <div className="flex-1">
                        <table className="w-full border border-black text-sm text-center table-fixed">
                            <thead>
                                <tr className="bg-gray-100">
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
                                        <td className="border border-black h-10">{data.input.toLocaleString()}</td>
                                        <td className="border border-black h-10">{data.output.toLocaleString()}</td>
                                        <td className="border border-black h-10">{data.stock.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {/* 총합계 행을 7~12월 표 아래에 추가 */}
                                <tr className="bg-blue-100">
                                    <td className="border border-black h-10 font-bold">총합계</td>
                                    <td className="border border-black h-10 font-bold">{totalInput.toLocaleString()}</td>
                                    <td className="border border-black h-10 font-bold">{totalOutput.toLocaleString()}</td>
                                    <td className="border border-black h-10 font-bold">{totalStock.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 mx-20">
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

                                // 월간보고서 선택 시 페이지 새로고침
                                if (newType === "monthly") {
                                    window.location.reload();
                                }
                            }}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="monthly">월간보고서</option>
                            <option value="partYearly">파트별 연간보고서</option>
                            <option value="allPartYearly">전파트 연간보고서</option>
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
                </div>
            </div>

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
                            <td className="border border-black w-16 h-16" rowSpan={2}>결<br />재</td>
                            <td className="border border-black w-16 h-8">담당</td>
                            <td className="border border-black w-16 h-8"></td>
                            <td className="border border-black w-16 h-8"></td>
                        </tr>
                        <tr>
                            <td className="border border-black h-8"></td>
                            <td className="border border-black h-8"></td>
                            <td className="border border-black h-8"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 문서 정보 */}
            <table className="w-full table-fixed border border-black text-sm text-center mb-6">
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
            <h2 className="text-left font-semibold mt-10 mb-2">{year}년 예산집행 현황</h2>
            <div className="text-right text-sm mb-2">(단위 : 원)</div>

            <table className="w-full border border-black text-sm text-center table-fixed">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black" colSpan={3}>구 분</th>
                        <th className="border border-black" colSpan={9}>예 산</th>
                        <th className="border border-black" colSpan={9}>연간집행 금액</th>
                        <th className="border border-black" colSpan={9}>집행률</th>
                        <th className="border border-black" colSpan={9}>잔 액</th>
                        <th className="border border-black" colSpan={3}>비 고</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black h-12" colSpan={3}>
                            연간
                        </td>
                        <td className="border border-black h-12" colSpan={9}>{budgetData?.amount?.toLocaleString() || 0}</td>
                        <td className="border border-black h-12" colSpan={9}>{(window.yearlyTotalInput || 0).toLocaleString()}</td>
                        <td className="border border-black h-12" colSpan={9}>
                            {budgetData?.amount ?
                                `${(((window.yearlyTotalInput || 0) / budgetData.amount) * 100).toFixed(1)}%` :
                                '0%'
                            }
                        </td>
                        <td className="border border-black h-12" colSpan={9}>{((budgetData?.amount || 0) - (window.yearlyTotalInput || 0)).toLocaleString()}</td>
                        <td className="border border-black h-12" colSpan={3}>&nbsp;</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default YearlyStatement; 