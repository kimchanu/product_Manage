import React, { useEffect, useState } from "react";
import DateSelector from "./Selector/DateSelector";
import User_info from "./User_info";
import ExcelStatementReport from "./Excel/ExcelStatementReport";

const Statement = () => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({});
    const [categories, setCategories] = useState([]);
    const [budgetData, setBudgetData] = useState(null);

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

    return (
        <div className="p-4 mx-20">
            <User_info setUser={setUser} />
            <div className="flex justify-end mb-2">
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
                />
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