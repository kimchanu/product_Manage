import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DateSelector from "./Selector/DateSelector";
import User_info from "./User_info";
import ExcelStatementReport from "./Excel/ExcelStatementReport";

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

    const renderMonthlyRow = (cat, type) => {
        const values = [];
        for (let month = 1; month <= 12; month++) {
            const monthData = monthlyData[month]?.[cat];
            if (monthData) {
                values.push(type === 'input' ? monthData.input : monthData.output);
            } else {
                values.push(0);
            }
        }

        const total = values.reduce((sum, val) => sum + val, 0);

        return (
            <tr key={`${cat}-${type}`}>
                <td className="border border-black h-10 text-left pl-4" rowSpan={type === 'input' ? 2 : 1}>
                    {type === 'input' ? cat : ''}
                </td>
                <td className="border border-black h-10">
                    {type === 'input' ? '입고' : '출고'}
                </td>
                {values.map((value, index) => (
                    <td key={index} className="border border-black h-10">
                        {value.toLocaleString()}
                    </td>
                ))}
                <td className="border border-black h-10 font-bold">
                    {total.toLocaleString()}
                </td>
            </tr>
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
            <table className="w-full border border-black text-sm text-center table-fixed">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black" rowSpan={2}>구 분</th>
                        <th className="border border-black" rowSpan={2}>구분</th>
                        <th className="border border-black" colSpan={12}>월별</th>
                        <th className="border border-black" rowSpan={2}>합계</th>
                    </tr>
                    <tr className="bg-gray-100">
                        <th className="border border-black">1월</th>
                        <th className="border border-black">2월</th>
                        <th className="border border-black">3월</th>
                        <th className="border border-black">4월</th>
                        <th className="border border-black">5월</th>
                        <th className="border border-black">6월</th>
                        <th className="border border-black">7월</th>
                        <th className="border border-black">8월</th>
                        <th className="border border-black">9월</th>
                        <th className="border border-black">10월</th>
                        <th className="border border-black">11월</th>
                        <th className="border border-black">12월</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((cat) => (
                        <React.Fragment key={cat}>
                            {renderMonthlyRow(cat, 'input')}
                            {renderMonthlyRow(cat, 'output')}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

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
                        <td className="border border-black h-12" colSpan={9}>{(stats.yearlyTotals?.["합 계"]?.input || 0).toLocaleString()}</td>
                        <td className="border border-black h-12" colSpan={9}>
                            {budgetData?.amount ?
                                `${(((stats.yearlyTotals?.["합 계"]?.input || 0) / budgetData.amount) * 100).toFixed(1)}%` :
                                '0%'
                            }
                        </td>
                        <td className="border border-black h-12" colSpan={9}>{((budgetData?.amount || 0) - (stats.yearlyTotals?.["합 계"]?.output || 0)).toLocaleString()}</td>
                        <td className="border border-black h-12" colSpan={3}>&nbsp;</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default YearlyStatement; 