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
    const [reportType, setReportType] = useState(searchParams.get("type") || "monthly"); // URL 파라미터에서 초기값 가져오기

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
    }, [user, year, month]);

    const renderRow = (cat) => {
        const row = stats.byCategory?.[cat] || {
            prevStock: 0,
            input: 0,
            output: 0,
            remaining: 0,
        };

        return (
            <tr key={cat}>
                <td className="border border-black h-12" colSpan={3}>{cat}</td>
                <td className="border border-black h-12" colSpan={9}>{row.prevStock.toLocaleString()}</td>
                <td className="border border-black h-12" colSpan={9}>{row.input.toLocaleString()}</td>
                <td className="border border-black h-12" colSpan={9}>{row.output.toLocaleString()}</td>
                <td className="border border-black h-12" colSpan={9}>{row.remaining.toLocaleString()}</td>
                <td className="border border-black h-12" colSpan={3}>&nbsp;</td>
            </tr>
        );
    };

    // 보고서 유형에 따라 다른 컴포넌트 렌더링
    if (reportType === "partYearly" || reportType === "allPartYearly") {
        return <YearlyStatement />;
    }

    // 월간보고서일 때는 기존 Statement 컴포넌트 렌더링

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
                    <ExcelStatementReport
                        stats={stats}
                        categories={categories}
                        year={year}
                        month={month}
                        user={user}
                        budgetAmount={budgetData?.amount || 0}
                        currentMonthAmount={stats.byCategory?.["합 계"]?.input || 0}
                        yearTotalInputAmount={stats.yearTotalInputAmount || 0}
                        remainingAmount={(budgetData?.amount || 0) - (stats.remaining || 0)}
                        reportType={reportType} // 추가: 보고서 유형 전달
                    />
                </div>
            </div>
            <div className="flex items-center justify-center gap-4 mb-6 px-4">
                <h1 className="text-xl font-bold whitespace-nowrap text-center">
                    {year}년 {month.toString().padStart(2, "0")}월 자재수불명세서대장
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
                        <td className="border border-black h-10 w-1/4">GK-{year.toString().slice(2)}-C-003</td>
                        <td className="border border-black h-10 w-1/4">작성일자</td>
                        <td className="border border-black h-10 w-1/4">{year}.{month.toString().padStart(2, "0")}</td>
                    </tr>
                    <tr>
                        <td className="border border-black h-10 w-1/4">부서명</td>
                        <td className="border border-black h-10 w-1/4">{user?.department || '\u00A0'}</td>
                        <td className="border border-black h-10 w-1/4">작성자</td>
                        <td className="border border-black h-10 w-1/4">{user?.name || '\u00A0'}</td>
                    </tr>
                </tbody>
            </table>

            {/* 자재수불명세서 표 */}
            <table className="w-full border border-black text-sm text-center table-fixed">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black" colSpan={3}>구 분</th>
                        <th className="border border-black" colSpan={9}>전월재고</th>
                        <th className="border border-black" colSpan={9}>입 고</th>
                        <th className="border border-black" colSpan={9}>출 고</th>
                        <th className="border border-black" colSpan={9}>재 고</th>
                        <th className="border border-black" colSpan={3}>비 고</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((cat) => renderRow(cat))}
                </tbody>
            </table>

            {/* 예산집행 현황 */}
            <h2 className="text-left font-semibold mt-10 mb-2">{year}년 예산집행 현황</h2>
            <div className="text-right text-sm mb-2">(단위 : 원)</div>

            <table className="w-full border border-black text-sm text-center table-fixed">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black" colSpan={3}>구 분</th>
                        <th className="border border-black" colSpan={9}>예 산</th>
                        <th className="border border-black" colSpan={9}>당월집행 금액</th>
                        <th className="border border-black" colSpan={9}>집행누계 금액</th>
                        <th className="border border-black" colSpan={9}>잔 액</th>
                        <th className="border border-black" colSpan={3}>비 고</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black h-12" colSpan={3}>
                            {month.toString().padStart(2, "0")}월
                        </td>
                        <td className="border border-black h-12" colSpan={9}>{budgetData?.amount?.toLocaleString() || 0}</td>
                        <td className="border border-black h-12" colSpan={9}>{(stats.byCategory?.["합 계"]?.input || 0).toLocaleString()}</td>
                        <td className="border border-black h-12" colSpan={9}>{(stats.yearTotalInputAmount || 0).toLocaleString()}</td>
                        <td className="border border-black h-12" colSpan={9}>{((budgetData?.amount || 0) - (stats.remaining || 0)).toLocaleString()}</td>
                        <td className="border border-black h-12" colSpan={3}>&nbsp;</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Statement;