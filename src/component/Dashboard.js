import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const LineChartCard = ({ title, data }) => (
    <div className="p-6 bg-white rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${(value / 1_0000).toLocaleString()}만`} />
                    <Tooltip formatter={(value) => `${value.toLocaleString()} 원`} />
                    <Legend />
                    <Line type="monotone" dataKey="ITS" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="기전" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="시설" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);


const StatCard = ({ title, valueList = [], highlight }) => (
    <div className={`p-4 rounded-2xl shadow ${highlight ? 'bg-blue-100' : 'bg-white'}`}>
        <p className="text-sm text-gray-500">{title}</p>
        <ul className="mt-2 space-y-1">
            {valueList.length > 0 ? (
                valueList.map((item, idx) => (
                    <li key={idx} className="text-base font-semibold">
                        {item.name}: {item.value.toLocaleString()} 원
                    </li>
                ))
            ) : (
                <li className="text-gray-400 text-sm">데이터 없음</li>
            )}
        </ul>
    </div>
);

const ChartCard = ({ title }) => (
    <div className="p-6 bg-white rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
            차트 영역
        </div>
    </div>
);

const OutputByLocationCard = ({ outputList }) => (
    <div className="p-6 bg-white rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">부서별 당월 출고</h2>
        <ul className="text-sm space-y-1">
            {outputList.length > 0 ? (
                outputList.map((item, idx) => (
                    <li key={idx}>{item.name}: {item.value.toLocaleString()} 원</li>
                ))
            ) : (
                <li className="text-gray-400">출고 데이터가 없습니다.</li>
            )}
        </ul>
    </div>
);

const InputByLocationCard = ({ inputList }) => (
    <div className="p-6 bg-white rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">부서별 당월 입고</h2>
        <ul className="text-sm space-y-1">
            {inputList.length > 0 ? (
                inputList.map((item, idx) => (
                    <li key={idx}>{item.name}: {item.value.toLocaleString()} 원</li>
                ))
            ) : (
                <li className="text-gray-400">입고 데이터가 없습니다.</li>
            )}
        </ul>
    </div>
);

const BudgetExecutionRateCard = ({ budgetList, yearTotalInputAmounts }) => {
    // 예산집행률 데이터 계산
    const executionRateData = budgetList.map((budget, index) => {
        const yearTotalInput = yearTotalInputAmounts[index] || 0;
        const rate = budget.value > 0 ? (yearTotalInput / budget.value) * 100 : 0;
        return {
            name: budget.name,
            value: rate,
            budget: budget.value,
            used: yearTotalInput,
            color: index === 0 ? "#8884d8" : index === 1 ? "#82ca9d" : "#ffc658"
        };
    });

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow">
                    <p className="font-semibold">{data.name}</p>
                    <p>집행률: {data.value.toFixed(1)}%</p>
                    <p>예산: {data.budget.toLocaleString()}원</p>
                    <p>집행액: {data.used.toLocaleString()}원</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">예산집행률</h2>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={executionRateData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {executionRateData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
                {executionRateData.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                        <span className="flex items-center">
                            <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: item.color }}
                            ></div>
                            {item.name}
                        </span>
                        <span className="font-semibold">{item.value.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 개별 부서별 예산집행률 차트 컴포넌트들
const ITSBudgetExecutionCard = ({ budgetList, yearTotalInputAmounts }) => {
    const itsBudget = budgetList.find(item => item.name === "ITS");
    const itsYearTotalInput = yearTotalInputAmounts[0] || 0;
    const rate = itsBudget?.value > 0 ? (itsYearTotalInput / itsBudget.value) * 100 : 0;

    const data = [
        { name: "집행률", value: rate, color: "#8884d8" },
        { name: "잔여", value: 100 - rate, color: "#f0f0f0" }
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            if (data.name === "집행률") {
                return (
                    <div className="bg-white p-3 border border-gray-200 rounded shadow">
                        <p className="font-semibold">ITS 부서</p>
                        <p>집행률: {rate.toFixed(1)}%</p>
                        <p>예산: {itsBudget?.value.toLocaleString()}원</p>
                        <p>집행액: {itsYearTotalInput.toLocaleString()}원</p>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">ITS 예산집행률</h2>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{rate.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">집행률</div>
            </div>
        </div>
    );
};

const MechanicalBudgetExecutionCard = ({ budgetList, yearTotalInputAmounts }) => {
    const mechanicalBudget = budgetList.find(item => item.name === "기전");
    const mechanicalYearTotalInput = yearTotalInputAmounts[1] || 0;
    const rate = mechanicalBudget?.value > 0 ? (mechanicalYearTotalInput / mechanicalBudget.value) * 100 : 0;

    const data = [
        { name: "집행률", value: rate, color: "#82ca9d" },
        { name: "잔여", value: 100 - rate, color: "#f0f0f0" }
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            if (data.name === "집행률") {
                return (
                    <div className="bg-white p-3 border border-gray-200 rounded shadow">
                        <p className="font-semibold">기전 부서</p>
                        <p>집행률: {rate.toFixed(1)}%</p>
                        <p>예산: {mechanicalBudget?.value.toLocaleString()}원</p>
                        <p>집행액: {mechanicalYearTotalInput.toLocaleString()}원</p>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">기전 예산집행률</h2>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-green-600">{rate.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">집행률</div>
            </div>
        </div>
    );
};

const FacilityBudgetExecutionCard = ({ budgetList, yearTotalInputAmounts }) => {
    const facilityBudget = budgetList.find(item => item.name === "시설");
    const facilityYearTotalInput = yearTotalInputAmounts[2] || 0;
    const rate = facilityBudget?.value > 0 ? (facilityYearTotalInput / facilityBudget.value) * 100 : 0;

    const data = [
        { name: "집행률", value: rate, color: "#ffc658" },
        { name: "잔여", value: 100 - rate, color: "#f0f0f0" }
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            if (data.name === "집행률") {
                return (
                    <div className="bg-white p-3 border border-gray-200 rounded shadow">
                        <p className="font-semibold">시설 부서</p>
                        <p>집행률: {rate.toFixed(1)}%</p>
                        <p>예산: {facilityBudget?.value.toLocaleString()}원</p>
                        <p>집행액: {facilityYearTotalInput.toLocaleString()}원</p>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">시설 예산집행률</h2>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{rate.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">집행률</div>
            </div>
        </div>
    );
};

// 게시판 컴포넌트 추가
const DashboardPostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardPosts();
    }, []);

    const fetchDashboardPosts = async () => {
        try {
            setLoading(true);
            // 공지사항과 최신 글을 우선적으로 가져오기 위해 limit을 늘려서 필터링
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts?page=1&limit=10`);
            const data = await res.json();

            if (res.ok) {
                // 공지사항, 중요글, 상단고정 글을 우선적으로 표시하고, 나머지는 최신순으로 정렬
                const sortedPosts = data.posts.sort((a, b) => {
                    // 공지사항이 가장 우선
                    if (a.is_notice && !b.is_notice) return -1;
                    if (!a.is_notice && b.is_notice) return 1;

                    // 중요글이 두 번째 우선
                    if (a.is_important && !b.is_important) return -1;
                    if (!a.is_important && b.is_important) return 1;

                    // 상단고정이 세 번째 우선
                    if (a.is_top && !b.is_top) return -1;
                    if (!a.is_top && b.is_top) return 1;

                    // 그 외에는 최신순
                    return new Date(b.created_at) - new Date(a.created_at);
                });

                // 상위 5개만 표시
                setPosts(sortedPosts.slice(0, 5));
            } else {
                console.error("게시글 불러오기 실패:", data.error);
                setError("게시글을 불러올 수 없습니다.");
            }
        } catch (err) {
            console.error("게시글 불러오기 실패:", err);
            setError("서버에 연결할 수 없습니다.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();
        if (isToday) {
            return date.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } else {
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }
    };

    const getCategoryLabel = (category, isNotice, isImportant, isTop) => {
        if (isNotice) return "공지";
        if (isImportant) return "중요";
        if (isTop) return "상단";
        switch (category) {
            case "question": return "질문";
            case "info": return "정보";
            case "guide": return "가이드";
            case "trade": return "거래";
            default: return "일반";
        }
    };

    const getCategoryColor = (category, isNotice, isImportant, isTop) => {
        if (isNotice) return "bg-blue-100 text-blue-800";
        if (isImportant) return "bg-red-100 text-red-800";
        if (isTop) return "bg-yellow-100 text-yellow-800";
        switch (category) {
            case "question": return "bg-green-100 text-green-800";
            case "info": return "bg-purple-100 text-purple-800";
            case "guide": return "bg-indigo-100 text-indigo-800";
            case "trade": return "bg-orange-100 text-orange-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <div className="p-6 bg-white rounded-2xl shadow">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">최신 게시글</h2>
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">게시글을 불러오는 중...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-2xl shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">최신 게시글</h2>
                <a
                    href="/PostList_page"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                    전체보기 →
                </a>
            </div>

            {error && (
                <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</div>
            )}

            {posts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    <div className="text-gray-400 mb-2">📝</div>
                    작성된 글이 없습니다.
                </div>
            ) : (
                <div className="space-y-2 h-64 overflow-y-auto">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
                            onClick={() => window.location.href = `/posts/${post.id}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(post.category, post.is_notice, post.is_important, post.is_top)}`}>
                                            {getCategoryLabel(post.category, post.is_notice, post.is_important, post.is_top)}
                                        </span>
                                        <span className="text-sm text-gray-600 font-medium">{post.author}</span>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 truncate leading-tight">
                                        {post.title}
                                        {post.comment_count > 0 && (
                                            <span className="ml-2 text-blue-500 text-xs font-medium">[{post.comment_count}]</span>
                                        )}
                                    </h3>
                                </div>
                                <div className="flex flex-col items-end gap-1 text-xs text-gray-500 ml-3">
                                    <span className="font-medium">{formatDate(post.created_at)}</span>
                                    <div className="flex items-center gap-2">
                                        <span>조회 {post.view_count}</span>
                                        <span>추천 {post.like_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Statistics_sub = ({ department }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [budgetList, setBudgetList] = useState([]);
    const [monthlyExpense, setMonthlyExpense] = useState(0);
    const [outputByLocation, setOutputByLocation] = useState([]);
    const [inputByLocation, setInputByLocation] = useState([]);
    const [yearTotalInputAmounts, setYearTotalInputAmounts] = useState([]);

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/budget?year=${currentYear}`
                );
                if (!response.ok) throw new Error("예산 조회 실패");
                const data = await response.json();
                const budgetData = data.budget || [];

                // 해당 사업소의 예산 데이터만 필터링
                const filtered = budgetData.filter((item) => item.site.toLowerCase() === department.toLowerCase());
                console.log(department);

                // 부서별 예산 정보 구성
                const result = ["ITS", "기전", "시설"].map((dept) => {
                    const match = filtered.find((item) => item.department === dept);
                    return {
                        name: dept,
                        value: match ? Number(match.amount) : 0,
                    };
                });

                setBudgetList(result);
            } catch (err) {
                console.error("예산 조회 실패:", err);
                setBudgetList([]);
            }
        };

        if (department) {
            fetchBudget();
        }
    }, [department]);

    const [budgetTrendData, setBudgetTrendData] = useState([]);

    useEffect(() => {
        const fetchTrend = async () => {
            try {
                const startYear = 2022;
                const endYear = currentYear;
                const promises = [];

                for (let y = startYear; y <= endYear; y++) {
                    promises.push(
                        fetch(`${process.env.REACT_APP_API_URL}/api/budget?year=${y}`).then((res) => res.json())
                    );
                }

                const results = await Promise.all(promises);

                const trend = results.map((res) => {
                    const year = res.year;
                    const data = res.budget || [];

                    const getAmount = (dept) => {
                        const found = data.find((d) => d.site.toLowerCase() === department.toLowerCase() && d.department === dept);
                        return found ? Number(found.amount) : 0;
                    };

                    return {
                        year,
                        ITS: getAmount("ITS"),
                        기전: getAmount("기전"),
                        시설: getAmount("시설"),
                    };
                });

                setBudgetTrendData(trend);
            } catch (err) {
                console.error("예산 추이 데이터 로딩 실패:", err);
                setBudgetTrendData([]);
            }
        };

        if (department) {
            fetchTrend();
        }
    }, [department]);

    // 입고 데이터 가져오기
    useEffect(() => {
        const fetchInputStatistics = async () => {
            try {
                // businessLocation 정규화 (사업소 제거)
                const normalizedLocation = department.replace('사업소', '');

                const promises = ["ITS", "기전", "시설"].map(dept =>
                    fetch(`${process.env.REACT_APP_API_URL}/api/statistics/input`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({
                            businessLocation: normalizedLocation,
                            department: dept,
                            year: currentYear,
                            month: currentMonth
                        })
                    }).then(res => res.json())
                );

                const results = await Promise.all(promises);
                const inputData = results.map((data, index) => ({
                    name: ["ITS", "기전", "시설"][index],
                    value: data.monthlyInputAmount || 0
                }));
                console.log(inputData);
                setInputByLocation(inputData);
            } catch (error) {
                console.error('입고 통계 조회 실패:', error);
                setInputByLocation([]);
            }
        };

        if (department) {
            fetchInputStatistics();
        }
    }, [department, currentYear, currentMonth]);

    // 출고 데이터 가져오기
    useEffect(() => {
        const fetchOutputStatistics = async () => {
            try {
                // businessLocation 정규화 (사업소 제거)
                const normalizedLocation = department.replace('사업소', '');

                const promises = ["ITS", "기전", "시설"].map(dept =>
                    fetch(`${process.env.REACT_APP_API_URL}/api/statistics/output`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({
                            businessLocation: normalizedLocation,
                            department: dept,
                            year: currentYear,
                            month: currentMonth
                        })
                    }).then(res => res.json())
                );

                const results = await Promise.all(promises);
                const outputData = results.map((data, index) => ({
                    name: ["ITS", "기전", "시설"][index],
                    value: data.monthlyOutputAmount || 0
                }));
                console.log('출고 데이터:', outputData);
                setOutputByLocation(outputData);
            } catch (error) {
                console.error('출고 통계 조회 실패:', error);
                setOutputByLocation([]);
            }
        };

        if (department) {
            fetchOutputStatistics();
        }
    }, [department, currentYear, currentMonth]);

    // 연간 총 입고 금액 가져오기
    useEffect(() => {
        const fetchYearTotalInput = async () => {
            try {
                // businessLocation 정규화 (사업소 제거)
                const normalizedLocation = department.replace('사업소', '');

                const promises = ["ITS", "기전", "시설"].map(dept =>
                    fetch(`${process.env.REACT_APP_API_URL}/api/statement`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({
                            businessLocation: normalizedLocation,
                            department: dept,
                            year: currentYear,
                            month: currentMonth,
                            categories: dept === "ITS" ? ["TCS", "FTMS", "전산", "기타", "합 계"] :
                                dept === "기전" ? ["전기", "기계", "소방", "기타", "합 계"] :
                                    ["안전", "장비", "시설보수", "조경", "기타", "합 계"]
                        })
                    }).then(res => res.json())
                );

                const results = await Promise.all(promises);
                const yearTotalData = results.map((data, index) => ({
                    name: ["ITS", "기전", "시설"][index],
                    value: data.yearTotalInputAmount || 0
                }));
                console.log('연간 총 입고 데이터:', yearTotalData);
                setYearTotalInputAmounts(yearTotalData.map(item => item.value));
            } catch (error) {
                console.error('연간 총 입고 통계 조회 실패:', error);
                setYearTotalInputAmounts([0, 0, 0]);
            }
        };

        if (department) {
            fetchYearTotalInput();
        }
    }, [department, currentYear, currentMonth]);

    return (
        <main className="ml-60 p-6 space-y-6 bg-gray-50 h-[calc(100vh-4rem)]">
            <h1 className="text-2xl font-bold mb-4">{department || "없음"}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title={`${department} ${currentYear} 예산`} valueList={budgetList} highlight />
                <InputByLocationCard inputList={inputByLocation} />
                <OutputByLocationCard outputList={outputByLocation} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ITSBudgetExecutionCard budgetList={budgetList} yearTotalInputAmounts={yearTotalInputAmounts} />
                        <MechanicalBudgetExecutionCard budgetList={budgetList} yearTotalInputAmounts={yearTotalInputAmounts} />
                        <FacilityBudgetExecutionCard budgetList={budgetList} yearTotalInputAmounts={yearTotalInputAmounts} />
                    </div>
                </div>
                <div className="lg:col-span-1 lg:row-span-2" style={{ gridRow: '1 / 3' }}>
                    <DashboardPostList />
                </div>
            </div>

            <LineChartCard title={`${department} 예산 추이`} data={budgetTrendData} />
            <div className="h-16" />

        </main>
    );
};

export default Statistics_sub;
