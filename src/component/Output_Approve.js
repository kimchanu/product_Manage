import React, { useEffect, useState } from "react";

const STATUS_COLOR = {
    "대기": "bg-yellow-100 text-yellow-800",
    "승인": "bg-green-100 text-green-800",
    "반려": "bg-red-100 text-red-800"
};

const OutputApprove = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rejectReason, setRejectReason] = useState({}); // {id: reason}
    const [actionLoading, setActionLoading] = useState({}); // {id: bool}

    // 출고 요청 목록 불러오기
    const fetchRequests = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/output-request?status=대기`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });
            if (!res.ok) throw new Error("출고 요청 목록을 불러오지 못했습니다.");
            const data = await res.json();
            setRequests(data.requests || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // 승인 처리
    const handleApprove = async (id) => {
        setActionLoading((prev) => ({ ...prev, [id]: true }));
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/output-request/${id}/approve`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });
            if (!res.ok) throw new Error("승인 처리에 실패했습니다.");
            await fetchRequests();
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading((prev) => ({ ...prev, [id]: false }));
        }
    };

    // 반려 처리
    const handleReject = async (id) => {
        if (!rejectReason[id] || rejectReason[id].trim() === "") {
            alert("반려 사유를 입력해주세요.");
            return;
        }
        setActionLoading((prev) => ({ ...prev, [id]: true }));
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/output-request/${id}/reject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                },
                body: JSON.stringify({ reason: rejectReason[id] })
            });
            if (!res.ok) throw new Error("반려 처리에 실패했습니다.");
            await fetchRequests();
            setRejectReason((prev) => ({ ...prev, [id]: "" }));
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading((prev) => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">출고 승인 요청 관리</h1>
            {loading ? (
                <div className="text-center py-10 text-lg">로딩 중...</div>
            ) : error ? (
                <div className="text-center text-red-500 py-10">{error}</div>
            ) : (
                <div className="bg-white shadow rounded-xl overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">요청ID</th>
                                <th className="p-3">자재ID</th>
                                <th className="p-3">요청수량</th>
                                <th className="p-3">요청자</th>
                                <th className="p-3">요청일</th>
                                <th className="p-3">부서</th>
                                <th className="p-3">사업소</th>
                                <th className="p-3">코멘트</th>
                                <th className="p-3">상태</th>
                                <th className="p-3">승인/반려</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="text-center py-8 text-gray-400">대기 중인 출고 요청이 없습니다.</td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 text-center">{req.id}</td>
                                        <td className="p-3 text-center">{req.material_id}</td>
                                        <td className="p-3 text-center">{req.request_qty}</td>
                                        <td className="p-3 text-center">{req.requester_id}</td>
                                        <td className="p-3 text-center">{req.request_date?.slice(0, 16).replace('T', ' ')}</td>
                                        <td className="p-3 text-center">{req.department}</td>
                                        <td className="p-3 text-center">{req.business_location}</td>
                                        <td className="p-3 text-left max-w-xs break-words">{req.comment || <span className="text-gray-400">-</span>}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLOR[req.status] || ''}`}>{req.status}</span>
                                        </td>
                                        <td className="p-3 text-center">
                                            {req.status === "대기" && (
                                                <div className="flex flex-col gap-2 items-center">
                                                    <button
                                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                                                        disabled={actionLoading[req.id]}
                                                        onClick={() => handleApprove(req.id)}
                                                    >
                                                        승인
                                                    </button>
                                                    <input
                                                        type="text"
                                                        placeholder="반려 사유 입력"
                                                        className="border rounded px-2 py-1 text-xs w-32"
                                                        value={rejectReason[req.id] || ""}
                                                        onChange={e => setRejectReason(prev => ({ ...prev, [req.id]: e.target.value }))}
                                                        disabled={actionLoading[req.id]}
                                                    />
                                                    <button
                                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                                                        disabled={actionLoading[req.id]}
                                                        onClick={() => handleReject(req.id)}
                                                    >
                                                        반려
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OutputApprove; 