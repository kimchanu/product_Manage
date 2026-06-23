import React, { useCallback, useEffect, useMemo, useState } from "react";
import User_info from "../User_info";

const formatPeriod = (year, month) => `${year}년 ${String(month).padStart(2, "0")}월`;

const statusOptions = [
  { value: "all", label: "전체" },
  { value: "submitted", label: "결재대기" },
  { value: "approved", label: "결재완료" },
];

const statusLabelMap = {
  submitted: "결재대기",
  approved: "결재완료",
};

function StatementApprovalCenter({ selectedBusinessLocation }) {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken");
  const businessLocation = selectedBusinessLocation || user?.business_location || "";

  const loadDocuments = useCallback(async () => {
    if (!token || !businessLocation) return;
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        businessLocation,
        status,
      });

      if (selectedDepartment) params.set("department", selectedDepartment);
      if (yearFilter) params.set("year", yearFilter);
      if (monthFilter) params.set("month", monthFilter);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/statement/approval/documents?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "문서 목록을 불러오지 못했습니다.");
      }
      setDocuments(data.documents || []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [token, businessLocation, status, selectedDepartment, yearFilter, monthFilter]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleApprove = async (doc) => {
    if (!token) return;
    setProcessingId(doc.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/statement/approval/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessLocation: doc.business_location,
          department: doc.department,
          year: doc.report_year,
          month: doc.report_month,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "결재 처리에 실패했습니다.");
      }
      setMessage(data.message || "결재가 완료되었습니다.");
      await loadDocuments();
    } catch (approveError) {
      setError(approveError.message);
    } finally {
      setProcessingId(null);
    }
  };

  const grouped = useMemo(() => {
    return {
      submitted: documents.filter((doc) => doc.status === "submitted"),
      approved: documents.filter((doc) => doc.status === "approved"),
    };
  }, [documents]);

  const renderTable = (rows, title, emptyLabel) => (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">대상월</th>
              <th className="px-4 py-3 text-left">부서</th>
              <th className="px-4 py-3 text-left">상신자</th>
              <th className="px-4 py-3 text-left">결재자</th>
              <th className="px-4 py-3 text-left">상태</th>
              <th className="px-4 py-3 text-left">상신일</th>
              <th className="px-4 py-3 text-left">결재일</th>
              <th className="px-4 py-3 text-right">동작</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((doc) => (
                <tr key={doc.id} className="border-t border-slate-100 text-slate-700">
                  <td className="px-4 py-3">{formatPeriod(doc.report_year, doc.report_month)}</td>
                  <td className="px-4 py-3">{doc.department}</td>
                  <td className="px-4 py-3">{doc.requester_name}</td>
                  <td className="px-4 py-3">{doc.approver_name}</td>
                  <td className="px-4 py-3">{statusLabelMap[doc.status] || doc.status}</td>
                  <td className="px-4 py-3">
                    {doc.submitted_at ? String(doc.submitted_at).slice(0, 16).replace("T", " ") : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {doc.approved_at ? String(doc.approved_at).slice(0, 16).replace("T", " ") : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {doc.status === "submitted" && Number(doc.can_approve) === 1 ? (
                      <button
                        type="button"
                        disabled={processingId === doc.id}
                        onClick={() => handleApprove(doc)}
                        className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        결재
                      </button>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      <User_info setUser={setUser} />

      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">전자결재 문서함</h1>
            <p className="mt-1 text-sm text-slate-500">
              결재 대기 문서를 처리하고, 완료된 자재수불명세서 결재 이력을 확인할 수 있습니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">전체 부서</option>
              <option value="ITS">ITS</option>
              <option value="시설">시설</option>
              <option value="기전">기전</option>
            </select>
            <input
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              placeholder="연도"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              placeholder="월"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadDocuments}
            disabled={loading}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            새로고침
          </button>
          <div className="text-sm text-slate-500">사업소: {businessLocation || "-"}</div>
        </div>

        {message && <div className="mt-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-500 shadow-sm">
          문서 목록을 불러오는 중입니다.
        </div>
      ) : (
        <div className="space-y-6">
          {renderTable(grouped.submitted, "결재 대기 문서", "결재 대기 문서가 없습니다.")}
          {renderTable(grouped.approved, "결재 완료 문서", "결재 완료 문서가 없습니다.")}
        </div>
      )}
    </div>
  );
}

export default StatementApprovalCenter;
