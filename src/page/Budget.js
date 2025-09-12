import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

function Budget() {
    const currentYear = new Date().getFullYear();

    // 조회할 연도 별도 상태
    const [queryYear, setQueryYear] = useState(currentYear);

    // 입력 폼 상태
    const [entry, setEntry] = useState({
        site: "",
        department: "",
        amount: "",
        year: currentYear,  // 입력용 연도
    });

    const [fetchedList, setFetchedList] = useState([]); // 조회된 예산
    const [inputList, setInputList] = useState([]);     // 새로 입력한 예산

    // queryYear 변경시 조회
    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/budget?year=${queryYear}`);
                if (!response.ok) throw new Error("예산 조회 실패");
                const data = await response.json();
                setFetchedList(data.budget || []);
            } catch (err) {
                console.error(err);
                setFetchedList([]);
            }
        };

        fetchBudget();
        setInputList([]); // 조회 연도 바뀌면 입력한 리스트 초기화
    }, [queryYear]);

    // 예산 입력 항목 추가
    const handleAdd = () => {
        const { site, department, amount, year } = entry;

        if (!site || !department || !amount || !year) {
            alert("사업소, 부서, 예산액, 연도를 모두 입력해주세요.");
            return;
        }

        const newEntry = {
            site,
            department,
            amount: Number(amount),
            year: Number(year),
        };

        // 중복 체크 (site, department, year 기준)
        const isDuplicate = [...fetchedList, ...inputList].some(
            (item) =>
                item.site === site &&
                item.department === department &&
                item.year === Number(year)
        );

        if (isDuplicate) {
            alert("이미 입력된 사업소, 부서, 연도 조합입니다.");
            return;
        }

        setInputList([...inputList, newEntry]);
        setEntry({ site: "", department: "", amount: "", year: year }); // 연도 유지
    };

    // 저장
    const handleSubmit = async () => {
        if (inputList.length === 0) {
            alert("추가된 예산 항목이 없습니다.");
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/budget`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // 각 예산 항목에 year 포함되도록 그대로 보냄
                body: JSON.stringify({
                    year: entry.year,
                    budget: inputList.map(({ site, department, amount, year }) => ({
                        site,
                        department,
                        amount,
                        year
                    }))
                }),
            });

            if (!response.ok) throw new Error("예산 저장 실패");
            alert("예산이 저장되었습니다.");
            setInputList([]);

            // 저장한 year 기준으로 조회
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/budget?year=${entry.year}`);
            const data = await res.json();
            setFetchedList(data.budget || []);
            setQueryYear(entry.year); // 선택된 year에도 반영 (선택)
        } catch (err) {
            console.error(err);
            alert("저장에 실패했습니다.");
        }
    };


    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">잡자재 예산 입력 및 조회</h1>

                {/* 조회용 연도 선택 */}
                <div className="mb-4 flex items-center space-x-4">
                    <label className="font-medium mr-2">조회 연도:</label>
                    <input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="조회할 연도 입력"
                        value={queryYear}
                        onChange={(e) => setQueryYear(Number(e.target.value))}
                        className="border rounded px-3 py-1 w-36"
                    />
                </div>

                {/* 예산 입력 폼 */}
                <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                    <select
                        value={entry.site}
                        onChange={(e) => setEntry({ ...entry, site: e.target.value })}
                        className="border rounded px-3 py-1 w-full md:w-48"
                    >
                        <option value="">사업소 선택</option>
                        <option value="GK사업소">GK사업소</option>
                        <option value="천마사업소">천마사업소</option>
                        <option value="을숙도사업소">을숙도사업소</option>
                    </select>

                    <select
                        value={entry.department}
                        onChange={(e) => setEntry({ ...entry, department: e.target.value })}
                        className="border rounded px-3 py-1 w-full md:w-48"
                    >
                        <option value="">부서 선택</option>
                        <option value="ITS">ITS</option>
                        <option value="기전">기전</option>
                        <option value="시설">시설</option>
                    </select>

                    <input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="입력할 연도"
                        value={entry.year}
                        onChange={(e) => setEntry({ ...entry, year: Number(e.target.value) })}
                        className="border rounded px-3 py-1 w-full md:w-36"
                    />

                    <input
                        type="number"
                        placeholder="예산액"
                        value={entry.amount}
                        onChange={(e) => setEntry({ ...entry, amount: e.target.value })}
                        className="border rounded px-3 py-1 w-full md:w-48 text-right"
                    />

                    <button
                        onClick={handleAdd}
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                    >
                        추가
                    </button>
                </div>

                {/* 조회된 예산 테이블 */}
                <h2 className="text-lg font-semibold mt-10 mb-2">🔍 조회된 예산</h2>
                <div className="overflow-x-auto bg-white shadow-md rounded-lg mb-6">
                    <table className="min-w-full table-auto border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">사업소</th>
                                <th className="border px-4 py-2">부서</th>
                                <th className="border px-4 py-2">년도</th> {/* 년도 컬럼 추가 */}
                                <th className="border px-4 py-2">예산액</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fetchedList.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">데이터가 없습니다.</td>
                                </tr>
                            ) : (
                                fetchedList.map((item, index) => (
                                    <tr key={index} className="text-center">
                                        <td className="border px-4 py-2">{item.site}</td>
                                        <td className="border px-4 py-2">{item.department}</td>
                                        <td className="border px-4 py-2">{item.year}</td> {/* 년도 출력 */}
                                        <td className="border px-4 py-2">{item.amount.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>


                {/* 입력한 예산 테이블 */}
                <h2 className="text-lg font-semibold mt-10 mb-2">✍️ 새로 입력한 예산</h2>
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    <table className="min-w-full table-auto border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">사업소</th>
                                <th className="border px-4 py-2">부서</th>
                                <th className="border px-4 py-2">년도</th> {/* 년도 추가 */}
                                <th className="border px-4 py-2">예산액</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inputList.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">입력된 항목이 없습니다.</td>
                                </tr>
                            ) : (
                                inputList.map((item, index) => (
                                    <tr key={index} className="text-center">
                                        <td className="border px-4 py-2">{item.site}</td>
                                        <td className="border px-4 py-2">{item.department}</td>
                                        <td className="border px-4 py-2">{item.year}</td> {/* 년도 출력 */}
                                        <td className="border px-4 py-2">{item.amount.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>


                {/* 저장 버튼 */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        저장
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Budget;
