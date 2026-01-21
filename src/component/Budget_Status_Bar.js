import React, { useState, useEffect } from 'react';

const Budget_Status_Bar = ({ businessLocation, department }) => {
    const [stats, setStats] = useState({
        budget: 0,
        used: 0,
        rate: 0
    });
    const [loading, setLoading] = useState(false);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    useEffect(() => {
        if (!businessLocation || !department) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. 사업소 코드 -> 이름 매핑
                const siteMap = {
                    "GK": "GK사업소",
                    "CM": "천마사업소",
                    "ES": "을숙도사업소",
                    "GN": "강남순환사업소"
                };
                const siteName = siteMap[businessLocation] || businessLocation;

                // 2. 예산 조회
                const budgetRes = await fetch(`${process.env.REACT_APP_API_URL}/api/budget?year=${currentYear}`);
                const budgetData = await budgetRes.json();

                // 해당 사업소(siteName) + 부서(department)의 예산 찾기
                const targetBudget = (budgetData.budget || []).find(
                    item => item.site === siteName && item.department === department
                );
                const budgetAmount = targetBudget ? Number(targetBudget.amount) : 0;

                // 3. 집행액(입고액) 조회
                // 부서별 카테고리 정의 (Dashboard.js 참조)
                const categories = department === "ITS" ? ["TCS", "FTMS", "전산", "기타", "합 계"] :
                    department === "기전" ? ["전기", "기계", "소방", "기타", "합 계"] :
                        ["안전", "장비", "시설보수", "조경", "기타", "합 계"]; // 시설

                const statementRes = await fetch(`${process.env.REACT_APP_API_URL}/api/statement`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({
                        businessLocation: businessLocation, // statement API는 코드를 받는지 이름을 받는지 확인 필요. Dashboard.js에서는 department.replace('사업소', '')를 보냄. 
                        // Product_list.js에서 businessLocation state는 "GK" 같은 코드임.
                        // Dashboard.js에서는 department가 "GK사업소" -> replace -> "GK".
                        // 따라서 여기서는 businessLocation 그대로 사용하면 됨.
                        department: department,
                        year: currentYear,
                        month: currentMonth,
                        categories: categories
                    })
                });

                const statementData = await statementRes.json();
                const usedAmount = statementData.yearTotalInputAmount || 0;

                const rate = budgetAmount > 0 ? (usedAmount / budgetAmount) * 100 : 0;

                setStats({
                    budget: budgetAmount,
                    used: usedAmount,
                    rate: rate
                });

            } catch (error) {
                console.error("예산 현황 조회 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [businessLocation, department, currentYear, currentMonth]);

    if (!businessLocation || !department) return null;

    // Bar Chart Visualization (Custom Progress Bar)
    return (
        <div className="mt-6 mb-10 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {currentYear}년 예산 집행 현황 ({department})
            </h3>

            {loading ? (
                <div className="animate-pulse flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
                        <span>집행률: {stats.rate.toFixed(1)}%</span>
                        <span>
                            {stats.used.toLocaleString()} / {stats.budget.toLocaleString()} 원
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 dark:bg-gray-700 overflow-hidden relative">
                        <div
                            className={`h-6 rounded-full transition-all duration-500 ease-in-out flex items-center justify-center text-xs font-bold text-white shadow-none ${stats.rate > 100 ? 'bg-red-600' :
                                stats.rate > 80 ? 'bg-orange-500' :
                                    'bg-blue-600'
                                }`}
                            style={{ width: `${Math.min(stats.rate, 100)}%` }}
                        >
                            {stats.rate > 5 && `${stats.rate.toFixed(1)}%`}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budget_Status_Bar;
