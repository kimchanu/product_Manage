import React, { useEffect, useState, useRef, useMemo } from "react";
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
                    <Tooltip
                        formatter={(v) => Math.round(v / 1000).toLocaleString()}
                    />
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

const YearCompareLineChartCard = ({
    title,
    data,
    xKey = "month",
    lines,
}) => (
    <div className="p-6 bg-white rounded-2xl shadow relative">
        {/* 제목 */}
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        {/* 🔹 단위 표시 (우상단) */}
        <div className="absolute top-6 right-6 text-xs text-gray-500">
            단위: 천원
        </div>

        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey={xKey} />

                    {/* ✅ 숫자만 */}
                    <YAxis
                        tickFormatter={(v) =>
                            Math.round(v / 1000).toLocaleString()
                        }
                    />

                    {/* ✅ 숫자만 */}
                    <Tooltip
                        formatter={(v) =>
                            Math.round(v / 1000).toLocaleString()
                        }
                    />

                    <Legend />

                    {lines.map((l) => (
                        <Line
                            key={l.dataKey}
                            type="monotone"
                            dataKey={l.dataKey}
                            name={l.name}
                            stroke={l.stroke}
                            strokeDasharray={l.strokeDasharray}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);


const moneyKrwThousandFmt = (v) => {
    const n = Number(v || 0);
    const inThousand = Math.round(n / 1000);
    return `${inThousand.toLocaleString()} 천원`;
};



const siteNameToCode = (siteName) => {
    if (!siteName) return siteName;

    // ✅ GK만 코드 사용
    if (siteName === "GK사업소" || siteName === "GK") {
        return "GK";
    }

    // ✅ 나머지는 한글 사업소명 그대로
    return siteName;
};


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
            <div className="h-40">
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
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                {/* 왼쪽: 예산 */}
                <div className="text-left">
                    <div className="text-xs text-gray-500">예산</div>
                    <div className="font-semibold">
                        {(itsBudget?.value || 0).toLocaleString()}원
                    </div>
                </div>

                {/* 가운데: 퍼센트 */}
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {rate.toFixed(1)}%
                    </div>
                </div>

                {/* 오른쪽: 집행액 */}
                <div className="text-right">
                    <div className="text-xs text-gray-500">집행액</div>
                    <div className="font-semibold">
                        {itsYearTotalInput.toLocaleString()}원
                    </div>
                </div>
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
            <div className="h-40">
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
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                {/* 왼쪽: 예산 */}
                <div className="text-left">
                    <div className="text-xs text-gray-500">예산</div>
                    <div className="font-semibold">
                        {(mechanicalBudget?.value || 0).toLocaleString()}원
                    </div>
                </div>

                {/* 가운데: 퍼센트 */}
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {rate.toFixed(1)}%
                    </div>
                </div>

                {/* 오른쪽: 집행액 */}
                <div className="text-right">
                    <div className="text-xs text-gray-500">집행액</div>
                    <div className="font-semibold">
                        {mechanicalYearTotalInput.toLocaleString()}원
                    </div>
                </div>
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
            <div className="h-40">
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
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                {/* 왼쪽: 예산 */}
                <div className="text-left">
                    <div className="text-xs text-gray-500">예산</div>
                    <div className="font-semibold">
                        {(facilityBudget?.value || 0).toLocaleString()}원
                    </div>
                </div>

                {/* 가운데: 퍼센트 */}
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {rate.toFixed(1)}%
                    </div>
                </div>

                {/* 오른쪽: 집행액 */}
                <div className="text-right">
                    <div className="text-xs text-gray-500">집행액</div>
                    <div className="font-semibold">
                        {facilityYearTotalInput.toLocaleString()}원
                    </div>
                </div>
            </div>

        </div>
    );
};

// 게시판 컴포넌트 추가
// const DashboardPostList = () => {
//     const [posts, setPosts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         fetchDashboardPosts();
//     }, []);

//     const fetchDashboardPosts = async () => {
//         try {
//             setLoading(true);
//             // 공지사항과 최신 글을 우선적으로 가져오기 위해 limit을 늘려서 필터링
//             const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts?page=1&limit=10`);
//             const data = await res.json();

//             if (res.ok) {
//                 // 공지사항, 중요글, 상단고정 글을 우선적으로 표시하고, 나머지는 최신순으로 정렬
//                 const sortedPosts = data.posts.sort((a, b) => {
//                     // 공지사항이 가장 우선
//                     if (a.is_notice && !b.is_notice) return -1;
//                     if (!a.is_notice && b.is_notice) return 1;

//                     // 중요글이 두 번째 우선
//                     if (a.is_important && !b.is_important) return -1;
//                     if (!a.is_important && b.is_important) return 1;

//                     // 상단고정이 세 번째 우선
//                     if (a.is_top && !b.is_top) return -1;
//                     if (!a.is_top && b.is_top) return 1;

//                     // 그 외에는 최신순
//                     return new Date(b.created_at) - new Date(a.created_at);
//                 });

//                 // 상위 5개만 표시
//                 setPosts(sortedPosts.slice(0, 5));
//             } else {
//                 console.error("게시글 불러오기 실패:", data.error);
//                 setError("게시글을 불러올 수 없습니다.");
//             }
//         } catch (err) {
//             console.error("게시글 불러오기 실패:", err);
//             setError("서버에 연결할 수 없습니다.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         const now = new Date();
//         const isToday = date.getFullYear() === now.getFullYear() &&
//             date.getMonth() === now.getMonth() &&
//             date.getDate() === now.getDate();
//         if (isToday) {
//             return date.toLocaleTimeString('ko-KR', {
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: false
//             });
//         } else {
//             return date.toLocaleDateString('ko-KR', {
//                 year: 'numeric',
//                 month: '2-digit',
//                 day: '2-digit'
//             });
//         }
//     };

//     const getCategoryLabel = (category, isNotice, isImportant, isTop) => {
//         if (isNotice) return "공지";
//         if (isImportant) return "중요";
//         if (isTop) return "상단";
//         switch (category) {
//             case "question": return "질문";
//             case "info": return "정보";
//             case "guide": return "가이드";
//             case "trade": return "거래";
//             default: return "일반";
//         }
//     };

//     const getCategoryColor = (category, isNotice, isImportant, isTop) => {
//         if (isNotice) return "bg-blue-100 text-blue-800";
//         if (isImportant) return "bg-red-100 text-red-800";
//         if (isTop) return "bg-yellow-100 text-yellow-800";
//         switch (category) {
//             case "question": return "bg-green-100 text-green-800";
//             case "info": return "bg-purple-100 text-purple-800";
//             case "guide": return "bg-indigo-100 text-indigo-800";
//             case "trade": return "bg-orange-100 text-orange-800";
//             default: return "bg-gray-100 text-gray-800";
//         }
//     };

//     if (loading) {
//         return (
//             <div className="p-6 bg-white rounded-2xl shadow">
//                 <h2 className="text-lg font-semibold text-gray-800 mb-4">최신 게시글</h2>
//                 <div className="flex justify-center items-center h-64">
//                     <div className="text-center">
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
//                         <p className="text-gray-500 text-sm">게시글을 불러오는 중...</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="p-6 bg-white rounded-2xl shadow">
//             <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-semibold text-gray-800">최신 게시글</h2>
//                 <a
//                     href="/PostList_page"
//                     className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
//                 >
//                     전체보기 →
//                 </a>
//             </div>

//             {error && (
//                 <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</div>
//             )}

//             {posts.length === 0 ? (
//                 <div className="text-center text-gray-500 py-8">
//                     <div className="text-gray-400 mb-2">📝</div>
//                     작성된 글이 없습니다.
//                 </div>
//             ) : (
//                 <div className="space-y-2 h-64 overflow-y-auto">
//                     {posts.map((post) => (
//                         <div
//                             key={post.id}
//                             className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
//                             onClick={() => window.location.href = `/posts/${post.id}`}
//                         >
//                             <div className="flex items-start justify-between">
//                                 <div className="flex-1 min-w-0">
//                                     <div className="flex items-center gap-2 mb-1">
//                                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(post.category, post.is_notice, post.is_important, post.is_top)}`}>
//                                             {getCategoryLabel(post.category, post.is_notice, post.is_important, post.is_top)}
//                                         </span>
//                                         <span className="text-sm text-gray-600 font-medium">{post.author}</span>
//                                     </div>
//                                     <h3 className="text-sm font-medium text-gray-900 truncate leading-tight">
//                                         {post.title}
//                                         {post.comment_count > 0 && (
//                                             <span className="ml-2 text-blue-500 text-xs font-medium">[{post.comment_count}]</span>
//                                         )}
//                                     </h3>
//                                 </div>
//                                 <div className="flex flex-col items-end gap-1 text-xs text-gray-500 ml-3">
//                                     <span className="font-medium">{formatDate(post.created_at)}</span>
//                                     <div className="flex items-center gap-2">
//                                         <span>조회 {post.view_count}</span>
//                                         <span>추천 {post.like_count}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

const Statistics_sub = ({ department }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const prevYear = currentYear - 1; // 2025
    const compareYears = [prevYear, currentYear];

    const [budgetList, setBudgetList] = useState([]);
    const [monthlyExpense, setMonthlyExpense] = useState(0);
    const [outputByLocation, setOutputByLocation] = useState([]);
    const [inputByLocation, setInputByLocation] = useState([]);

    const [compareLoading, setCompareLoading] = useState(false);
    const [compareError, setCompareError] = useState("");
    const [cumulativeMode, setCumulativeMode] = useState(false); // 누적 토글
    const [activeDeptTab, setActiveDeptTab] = useState("합 계"); // "합 계" | "ITS" | "시설" | "기전"
    const compareCacheRef = useRef(new Map());
    const [yearlyMonthly, setYearlyMonthly] = useState({
        [prevYear]: [],
        [currentYear]: [],
    });

    const [yearTotalInputAmounts, setYearTotalInputAmounts] = useState([]);




    // 사업소 이름 매핑 (Side_Bar에서 전달되는 값 -> DB에 저장된 값)
    const normalizeSiteName = (site) => {
        const siteMap = {
            "GK사업소": "GK사업소",
            "천마사업소": "천마사업소",
            "을숙도사업소": "을숙도사업소",
            "수원사업소": "수원사업소",
            "강남사업소": "강남사업소"
        };
        return siteMap[site] || site;
    };

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/budget?year=${currentYear}`
                );
                if (!response.ok) throw new Error("예산 조회 실패");
                const data = await response.json();
                const budgetData = data.budget || [];

                // 해당 사업소의 예산 데이터만 필터링 (정규화된 이름으로 비교)
                const normalizedDepartment = normalizeSiteName(department);
                const filtered = budgetData.filter((item) => item.site === normalizedDepartment);
                console.log(department, normalizedDepartment);

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
                    const normalizedDepartment = normalizeSiteName(department);

                    const getAmount = (dept) => {
                        const found = data.find((d) => d.site === normalizedDepartment && d.department === dept);
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

    useEffect(() => {
        const fetchYearMonthly = async (siteCode, year) => {
            const cacheKey = `${siteCode}-${year}`;
            if (compareCacheRef.current.has(cacheKey)) {
                return compareCacheRef.current.get(cacheKey);
            }

            const months = Array.from({ length: 12 }, (_, i) => i + 1);

            const results = await Promise.all(
                months.map(async (m) => {
                    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/statement/all-part-monthly`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        },
                        body: JSON.stringify({
                            businessLocation: siteCode, // ✅ 사업소 코드
                            year,
                            month: m,
                        }),
                    });

                    const json = await res.json();
                    if (!res.ok) {
                        throw new Error(json?.message || `월간 데이터 조회 실패 (${year}-${m})`);
                    }

                    // byCategory 안에 "합 계", "ITS", "시설", "기전" 키가 존재하는 구조(너가 준 코드 기준)
                    const by = json?.byCategory || {};
                    const pick = (key) => ({
                        input: by?.[key]?.input || 0,
                        output: by?.[key]?.output || 0,
                    });

                    return {
                        month: m,
                        byDept: {
                            "합 계": pick("합 계"),
                            ITS: pick("ITS"),
                            시설: pick("시설"),
                            기전: pick("기전"),
                        },
                    };
                })
            );

            compareCacheRef.current.set(cacheKey, results);
            return results;
        };

        const run = async () => {
            if (!department) return;

            const siteCode = siteNameToCode(department);

            setCompareLoading(true);
            setCompareError("");

            try {
                const [dataPrev, dataCurr] = await Promise.all([
                    fetchYearMonthly(siteCode, prevYear),
                    fetchYearMonthly(siteCode, currentYear),
                ]);

                setYearlyMonthly({
                    [prevYear]: dataPrev,
                    [currentYear]: dataCurr,
                });
            } catch (e) {
                console.error(e);
                setCompareError(e?.message || "연도 비교 데이터를 불러오지 못했습니다.");
                setYearlyMonthly({
                    [prevYear]: [],
                    [currentYear]: [],
                });
            } finally {
                setCompareLoading(false);
            }
        };

        run();
    }, [department, prevYear, currentYear]);

    const toCumulative = (arr, getVal) => {
        let sum = 0;
        return arr.map((x) => {
            sum += getVal(x);
            return sum;
        });
    };

    const DEPTS = ["ITS", "시설", "기전"];

    const compareChartData = useMemo(() => {
        const a = yearlyMonthly[prevYear] || [];
        const b = yearlyMonthly[currentYear] || [];

        const months = Array.from({ length: 12 }, (_, i) => i + 1);

        // yearArr에서 특정 월/부서/타입(input|output) 값 꺼내기
        const getVal = (yearArr, m, deptKey, type) => {
            const row = yearArr.find((r) => r.month === m);
            if (!row) return 0;
            return row.byDept?.[deptKey]?.[type] || 0;
        };

        // ✅ 1) 월별 기본 데이터 만들기
        const base = months.map((m) => {
            // 🔥 합 계 탭이면: ITS/시설/기전 3개를 동시에 보여주기 위해 키를 더 만든다
            if (activeDeptTab === "합 계") {
                const obj = { month: m };

                DEPTS.forEach((d) => {
                    obj[`inputPrev_${d}`] = getVal(a, m, d, "input");
                    obj[`inputCurr_${d}`] = getVal(b, m, d, "input");
                    obj[`outputPrev_${d}`] = getVal(a, m, d, "output");
                    obj[`outputCurr_${d}`] = getVal(b, m, d, "output");
                });

                return obj;
            }

            // 🔥 합계가 아니면: 선택된 탭(ITS/시설/기전) 1개만 기존처럼
            return {
                month: m,
                inputPrev: getVal(a, m, activeDeptTab, "input"),
                inputCurr: getVal(b, m, activeDeptTab, "input"),
                outputPrev: getVal(a, m, activeDeptTab, "output"),
                outputCurr: getVal(b, m, activeDeptTab, "output"),
            };
        });

        // ✅ 누적 모드 OFF면 그대로 반환
        if (!cumulativeMode) return base;

        // ✅ 2) 누적 모드로 바꾸기 (키 목록을 누적합)
        const toCumulativeKeys = (arr, keys) => {
            const sums = {};
            keys.forEach((k) => (sums[k] = 0));

            return arr.map((row) => {
                const next = { ...row };
                keys.forEach((k) => {
                    sums[k] += Number(row[k] || 0);
                    next[k] = sums[k];
                });
                return next;
            });
        };

        // 합 계 탭이면: 부서별 12개 키 누적 (input/output × 2년 × 3부서 = 12)
        if (activeDeptTab === "합 계") {
            const keys = [];
            DEPTS.forEach((d) => {
                keys.push(
                    `inputPrev_${d}`, `inputCurr_${d}`,
                    `outputPrev_${d}`, `outputCurr_${d}`
                );
            });
            return toCumulativeKeys(base, keys);
        }

        // 기타 탭이면: 기존 4개 키 누적
        return toCumulativeKeys(base, ["inputPrev", "inputCurr", "outputPrev", "outputCurr"]);
    }, [yearlyMonthly, prevYear, currentYear, cumulativeMode, activeDeptTab]);

    const yearColors = {
        prev: "#64748b", // 2025(작년) - slate
        curr: "#2563eb", // 2026(금년) - blue
    };

    // 합계 탭에서 부서별 색(요청사항)
    const deptColors = {
        ITS: "#8b5cf6",  // purple
        시설: "#f59e0b", // amber
        기전: "#10b981", // emerald
    };

    const inputLines =
        activeDeptTab === "합 계"
            ? (["ITS", "시설", "기전"].flatMap((d) => ([
                // ✅ 2025 먼저(왼쪽/먼저 보이게) + 점선
                { dataKey: `inputPrev_${d}`, name: `${d} ${prevYear}`, stroke: deptColors[d], strokeDasharray: "6 4" },
                // ✅ 2026 나중 + 실선
                { dataKey: `inputCurr_${d}`, name: `${d} ${currentYear}`, stroke: deptColors[d] },
            ])))
            : ([
                { dataKey: "inputPrev", name: `${prevYear} 입고`, stroke: yearColors.prev, strokeDasharray: "6 4" },
                { dataKey: "inputCurr", name: `${currentYear} 입고`, stroke: yearColors.curr },
            ]);

    const outputLines =
        activeDeptTab === "합 계"
            ? (["ITS", "시설", "기전"].flatMap((d) => ([
                { dataKey: `outputPrev_${d}`, name: `${d} ${prevYear}`, stroke: deptColors[d], strokeDasharray: "6 4" },
                { dataKey: `outputCurr_${d}`, name: `${d} ${currentYear}`, stroke: deptColors[d] },
            ])))
            : ([
                { dataKey: "outputPrev", name: `${prevYear} 출고`, stroke: yearColors.prev, strokeDasharray: "6 4" },
                { dataKey: "outputCurr", name: `${currentYear} 출고`, stroke: yearColors.curr },
            ]);




    return (
        <main className="ml-60 p-6 space-y-6 bg-gray-50 h-[calc(100vh-4rem)]">
            <h1 className="text-2xl font-bold mb-4">{department || "없음"}</h1>

            {/* ================= 연도별 입고/출고 비교 섹션 (상단 배치) ================= */}
            <div className="p-6 bg-white rounded-2xl shadow space-y-5">

                {/* 헤더 + 누적 토글 */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {department} 입·출고 금액 비교 ({currentYear - 1} vs {currentYear})
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {activeDeptTab} 기준 · {cumulativeMode ? "누적(1~월)" : "월별"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setCumulativeMode(v => !v)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                        ${cumulativeMode
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        누적 {cumulativeMode ? "ON" : "OFF"}
                    </button>
                </div>

                {/* 부서 탭 */}
                <div className="flex flex-wrap gap-2">
                    {["합 계", "ITS", "시설", "기전"].map(tab => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveDeptTab(tab)}
                            className={`px-4 py-2 rounded-full text-sm border transition
                            ${activeDeptTab === tab
                                    ? "bg-blue-100 text-blue-700 border-blue-300 font-semibold"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* 로딩 / 에러 */}
                {compareLoading && (
                    <div className="text-sm text-gray-500">
                        연도 비교 데이터를 불러오는 중입니다...
                    </div>
                )}

                {compareError && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                        {compareError}
                    </div>
                )}

                {/* 차트 영역 */}
                {!compareLoading && !compareError && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        <YearCompareLineChartCard
                            title={`입고 금액 (${prevYear} vs ${currentYear})`}
                            data={compareChartData}
                            lines={inputLines}
                            valueFormatter={moneyKrwThousandFmt}
                        />

                        <YearCompareLineChartCard
                            title={`출고 금액 (${prevYear} vs ${currentYear})`}
                            data={compareChartData}
                            lines={outputLines}
                            valueFormatter={moneyKrwThousandFmt}
                        />

                    </div>
                )}
            </div>
            {/* ================= 연도별 입고/출고 비교 섹션 끝 ================= */}


            {/* ================= 예산 집행률 카드 ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ITSBudgetExecutionCard
                    budgetList={budgetList}
                    yearTotalInputAmounts={yearTotalInputAmounts}
                />
                <MechanicalBudgetExecutionCard
                    budgetList={budgetList}
                    yearTotalInputAmounts={yearTotalInputAmounts}
                />
                <FacilityBudgetExecutionCard
                    budgetList={budgetList}
                    yearTotalInputAmounts={yearTotalInputAmounts}
                />
            </div>

            {/* ================= 요약 카드 (아래로 이동) ================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title={`${department} ${currentYear} 예산`}
                    valueList={budgetList}
                    highlight
                />
                <InputByLocationCard inputList={inputByLocation} />
                <OutputByLocationCard outputList={outputByLocation} />
            </div>


            <div className="h-16" />
        </main>
    );


};

export default Statistics_sub;
