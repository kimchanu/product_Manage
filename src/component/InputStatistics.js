import React, { useState, useEffect } from "react";
import User_info from "./User_info";
import { jwtDecode } from "jwt-decode";

const InputStatistics = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);



    useEffect(() => {
        if (userInfo) {
            console.log('Current userInfo:', userInfo);
            fetchStatistics();
        }
    }, [userInfo, year, month]);

    const fetchStatistics = async () => {
        if (!userInfo) {
            console.log('userInfo is null or undefined');
            return;
        }


        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/statistics/input`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    businessLocation: userInfo.business_location,
                    department: userInfo.department,
                    year,
                    month
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '통계 데이터를 불러오는데 실패했습니다.');
            }

            const data = await response.json();
            console.log('Received statistics:', data);
            console.log('Total input amount:', data.totalInputAmount);
            console.log('Monthly input amount:', data.monthlyInputAmount);
            console.log('Recent inputs:', data.recentInputs);
            console.log('Monthly trend data:', data.monthlyTrend);
            setStatistics(data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <User_info setUser={setUserInfo} />

            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">입고 통계</h1>

            <div className="mb-6 flex justify-end gap-4">
                <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="border rounded p-2"
                    disabled={loading}
                >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                        <option key={y} value={y}>{y}년</option>
                    ))}
                </select>
                <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="border rounded p-2"
                    disabled={loading}
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{m}월</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center">로딩 중...</div>
            ) : statistics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">누적 입고 금액</h2>
                        <p className="text-2xl">{formatCurrency(statistics.totalInputAmount)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">당월 입고 금액</h2>
                        <p className="text-2xl">{formatCurrency(statistics.monthlyInputAmount)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">월별 추이</h2>
                        <div className="h-64">
                            {statistics.monthlyTrend && statistics.monthlyTrend.length > 0 ? (
                                <div className="flex items-end justify-between h-48 px-4">
                                    {statistics.monthlyTrend.map((amount, index) => {
                                        const maxAmount = Math.max(...statistics.monthlyTrend);
                                        const heightPercentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                                        const isCurrentMonth = index + 1 === month;

                                        return (
                                            <div key={index} className="flex flex-col items-center flex-1 mx-1">
                                                {/* 금액 표시 */}
                                                <div className="text-xs text-gray-600 mb-1 text-center">
                                                    {amount > 0 ? formatCurrency(amount) : '-'}
                                                </div>

                                                {/* 막대 */}
                                                <div className="w-full flex justify-center">
                                                    <div
                                                        className={`w-8 rounded-t-lg transition-all duration-300 hover:opacity-80 ${isCurrentMonth
                                                            ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg'
                                                            : 'bg-gradient-to-t from-blue-500 to-blue-300'
                                                            }`}
                                                        style={{
                                                            height: `${Math.max(heightPercentage, 2)}%`,
                                                            minHeight: amount > 0 ? '8px' : '0px'
                                                        }}
                                                        title={`${index + 1}월: ${formatCurrency(amount)}`}
                                                    >
                                                        {/* 막대 내부 효과 */}
                                                        <div className="w-full h-full bg-white opacity-20 rounded-t-lg"></div>
                                                    </div>
                                                </div>

                                                {/* 월 표시 */}
                                                <div className={`text-xs mt-2 font-medium ${isCurrentMonth ? 'text-blue-600 font-bold' : 'text-gray-500'
                                                    }`}>
                                                    {index + 1}월
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-48 text-gray-500">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">📊</div>
                                        <div>월별 데이터가 없습니다.</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">당월 입고 내역</h2>
                        <div className="space-y-2">
                            {statistics.recentInputs?.filter(input => input.quantity > 0).map((input, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm">{input.name || '-'}</span>
                                    <span className="text-sm font-medium">
                                        {input.quantity?.toLocaleString() || '-'} 개
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(input.date)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center">데이터가 없습니다.</div>
            )}
        </div>
    );
};

export default InputStatistics;