import React, { useState, useEffect } from "react";
import User_info from "./User_info";
import { jwtDecode } from "jwt-decode";

const InputStatistics = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allInputs, setAllInputs] = useState([]);
    const [showAllModal, setShowAllModal] = useState(false);
    const [loadingAll, setLoadingAll] = useState(false);



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
                    month,
                    includeAllInputs: false
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

    const fetchAllInputs = async () => {
        if (!userInfo) return;
        setLoadingAll(true);
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
                    month,
                    includeAllInputs: true
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '전체 입고 내역을 불러오는데 실패했습니다.');
            }
            const data = await response.json();
            setAllInputs(data.allInputs || []);
            setShowAllModal(true);
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setLoadingAll(false);
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
                    <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
                        <h2 className="text-xl font-bold mb-4">월별 추이</h2>
                        <div className="h-64 overflow-x-auto">
                            {statistics.monthlyTrend && statistics.monthlyTrend.length > 0 ? (
                                <div className="px-4 min-w-full">
                                    <div className="flex justify-between" style={{ height: '240px' }}>
                                        {statistics.monthlyTrend.map((amount, index) => {
                                            const maxAmount = Math.max(...statistics.monthlyTrend);
                                            const barHeight = maxAmount > 0 ? Math.max((amount / maxAmount) * 192, amount > 0 ? 8 : 0) : 0;
                                            const isCurrentMonth = index + 1 === month;

                                            return (
                                                <div key={index} className="flex flex-col items-center flex-1 mx-1 min-w-0 relative" style={{ height: '240px' }}>
                                                    {/* 금액 표시 - 막대 위에 절대 위치 */}
                                                    <div 
                                                        className="text-xs text-gray-600 text-center truncate w-full absolute z-10" 
                                                        style={{ 
                                                            bottom: `${30 + barHeight}px`,
                                                            maxWidth: '100%',
                                                            height: '20px',
                                                            lineHeight: '20px'
                                                        }}
                                                    >
                                                        {amount > 0 ? formatCurrency(amount) : '-'}
                                                    </div>

                                                    {/* 막대 영역 - 고정 높이, 하단 정렬 */}
                                                    <div className="w-full flex justify-center items-end absolute" style={{ bottom: '30px', height: '192px', left: 0, right: 0 }}>
                                                        <div
                                                            className={`w-8 rounded-t-lg transition-all duration-300 hover:opacity-80 ${isCurrentMonth
                                                                ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg'
                                                                : 'bg-gradient-to-t from-blue-500 to-blue-300'
                                                                }`}
                                                            style={{
                                                                height: `${barHeight}px`,
                                                                minHeight: amount > 0 ? '8px' : '0px'
                                                            }}
                                                            title={`${index + 1}월: ${formatCurrency(amount)}`}
                                                        >
                                                            {/* 막대 내부 효과 */}
                                                            <div className="w-full h-full bg-white opacity-20 rounded-t-lg"></div>
                                                        </div>
                                                    </div>

                                                    {/* 월 표시 - 항상 맨 아래 고정 */}
                                                    <div className={`text-xs font-medium absolute bottom-0 ${isCurrentMonth ? 'text-blue-600 font-bold' : 'text-gray-500'
                                                        }`} style={{ height: '20px', lineHeight: '20px' }}>
                                                        {index + 1}월
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
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
                    <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">당월 입고 내역</h2>
                            {statistics.totalInputsCount > (statistics.recentInputs?.length || 0) && (
                                <button
                                    disabled={loadingAll}
                                    onClick={fetchAllInputs}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-60"
                                >
                                    {loadingAll ? '불러오는 중...' : '전체보기'}
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {/* 헤더 */}
                            <div className="grid grid-cols-8 text-xs font-semibold text-gray-600 px-2 gap-3">
                                <span>자재코드</span>
                                <span>품명</span>
                                <span>규격</span>
                                <span className="text-right">단가</span>
                                <span className="text-right">수량</span>
                                <span className="text-right">금액</span>
                                <span>담당자</span>
                                <span>날짜</span>
                            </div>
                            {statistics.recentInputs?.filter(input => input.quantity > 0).map((input, index) => {
                                const price = input.price ?? 0;
                                const qty = input.quantity ?? 0;
                                const amount = price * qty;
                                return (
                                    <div key={index} className="grid grid-cols-8 items-center text-sm px-2 py-1 bg-gray-50 rounded gap-3">
                                        <span className="truncate">
                                            {input.material_code
                                                || input.materialCode
                                                || input.material?.material_code
                                                || input.material?.materialCode
                                                || '-'}
                                        </span>
                                        <span className="truncate">
                                            {input.name
                                                || input.material?.name
                                                || '-'}
                                        </span>
                                        <span className="truncate">
                                            {input.specification
                                                || input.spec
                                                || input.material?.specification
                                                || input.material?.spec
                                                || '-'}
                                        </span>
                                        <span className="text-right">{price ? price.toLocaleString() : '-'}</span>
                                        <span className="text-right font-medium">
                                            {qty ? qty.toLocaleString() : '-'}
                                        </span>
                                        <span className="text-right font-medium">
                                            {amount ? amount.toLocaleString() : '-'}
                                        </span>
                                        <span className="truncate ml-1">
                                            {input.input_user
                                                || input.user_name
                                                || input.user
                                                || input.user_id
                                                || input.userId
                                                || input.manager
                                                || input.user_info?.name
                                                || '-'}
                                        </span>
                                        <span className="text-gray-500">
                                            {formatDate(input.date)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center">데이터가 없습니다.</div>
            )}

            {/* 전체보기 모달 */}
            {showAllModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white w-11/12 max-w-5xl max-h-[80vh] rounded-lg shadow-lg p-4 overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">입고 내역 전체</h3>
                            <button
                                className="text-sm text-gray-600 hover:text-gray-800"
                                onClick={() => setShowAllModal(false)}
                            >
                                닫기
                            </button>
                        </div>
                        <div className="grid grid-cols-8 text-xs font-semibold text-gray-600 px-2 gap-3 mb-2">
                            <span>자재코드</span>
                            <span>품명</span>
                            <span>규격</span>
                            <span className="text-right">단가</span>
                            <span className="text-right">수량</span>
                            <span className="text-right">금액</span>
                            <span>담당자</span>
                            <span>날짜</span>
                        </div>
                        <div className="space-y-1">
                            {(allInputs || []).map((input, idx) => {
                                const price = input.price ?? 0;
                                const qty = input.quantity ?? 0;
                                const amount = price * qty;
                                return (
                                    <div key={idx} className="grid grid-cols-8 items-center text-sm px-2 py-1 bg-gray-50 rounded gap-3">
                                        <span className="truncate">
                                            {input.material_code
                                                || input.materialCode
                                                || input.material?.material_code
                                                || input.material?.materialCode
                                                || '-'}
                                        </span>
                                        <span className="truncate">
                                            {input.name
                                                || input.material?.name
                                                || '-'}
                                        </span>
                                        <span className="truncate">
                                            {input.specification
                                                || input.spec
                                                || input.material?.specification
                                                || input.material?.spec
                                                || '-'}
                                        </span>
                                        <span className="text-right">{price ? price.toLocaleString() : '-'}</span>
                                        <span className="text-right font-medium">
                                            {qty ? qty.toLocaleString() : '-'}
                                        </span>
                                        <span className="text-right font-medium">
                                            {amount ? amount.toLocaleString() : '-'}
                                        </span>
                                        <span className="truncate ml-1">
                                            {input.input_user
                                                || input.user_name
                                                || input.user
                                                || input.user_id
                                                || input.userId
                                                || input.manager
                                                || input.user_info?.name
                                                || '-'}
                                        </span>
                                        <span className="text-gray-500">
                                            {formatDate(input.date)}
                                        </span>
                                    </div>
                                );
                            })}
                            {(allInputs || []).length === 0 && (
                                <div className="text-center text-gray-500 py-4">입고 내역이 없습니다.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InputStatistics;