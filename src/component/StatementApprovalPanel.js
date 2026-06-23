import React, { useCallback, useEffect, useState } from "react";

const formatPeriod = (year, month) => `${year}년 ${String(month).padStart(2, "0")}월`;

function StatementApprovalPanel({ user, businessLocation, department, year, month, reportType }) {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const visible = Boolean(
    user &&
      businessLocation &&
      department &&
      ["monthly", "allPartMonthly"].includes(reportType)
  );

  const token = localStorage.getItem("authToken");

  const loadMeta = useCallback(async () => {
    if (!visible || !token) return;
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        businessLocation,
        department,
        year: String(year),
        month: String(month),
      });
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/statement/approval/meta?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "전자결재 정보를 불러오지 못했습니다.");
      }

      setMeta(data);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [visible, token, businessLocation, department, year, month]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta, reportType]);

  const callAction = async (path, method, body) => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "처리에 실패했습니다.");
      }
      setMessage(data.message || "완료되었습니다.");
      await loadMeta();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  const statusLabelMap = {
    submitted: "상신됨",
    approved: "결재완료",
  };

  const currentStatus = meta?.document?.status;
  const pendingDocuments = meta?.pendingDocuments || [];
  const currentApprover = meta?.setting?.approver_name || "미지정";
  const latestApproved = meta?.latestApprovedDocument;

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="text-lg font-semibold text-slate-800">전자결재</div>
          <div className="text-sm text-slate-600">
            대상: {department} / {formatPeriod(year, month)}
          </div>
          <div className="text-sm text-slate-600">
            승인자: {currentApprover} {meta?.setting ? "" : "(관리자 페이지에서 지정)"}
          </div>
          <div className="text-sm text-slate-600">
            현재 상태: {statusLabelMap[currentStatus] || "미상신"}
          </div>
          <div className="text-sm text-amber-700">
            {latestApproved
              ? `잠금 기준: ${formatPeriod(
                  latestApproved.report_year,
                  latestApproved.report_month
                )} 결재 완료`
              : "아직 잠금된 월이 없습니다."}
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:min-w-[320px]">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving || !meta?.permissions?.canSubmit || !meta?.setting}
              onClick={() =>
                callAction("/api/statement/approval/submit", "POST", {
                  businessLocation,
                  department,
                  year,
                  month,
                })
              }
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              상신
            </button>
            <button
              type="button"
              disabled={saving || !meta?.permissions?.canApprove || currentStatus !== "submitted"}
              onClick={() =>
                callAction("/api/statement/approval/approve", "POST", {
                  businessLocation,
                  department,
                  year,
                  month,
                })
              }
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              결재
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="mt-3 text-sm text-slate-500">전자결재 정보를 불러오는 중입니다.</div>}
      {message && <div className="mt-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}

      {pendingDocuments.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 text-sm font-medium text-slate-700">내 결재 대기 문서</div>
          <div className="space-y-2">
            {pendingDocuments.map((doc) => (
              <div
                key={`${doc.business_location}-${doc.department}-${doc.report_year}-${doc.report_month}`}
                className="flex flex-col gap-1 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 md:flex-row md:items-center md:justify-between"
              >
                <span>
                  {doc.department} / {formatPeriod(doc.report_year, doc.report_month)} / {doc.requester_name}
                </span>
                <span className="text-slate-500">{statusLabelMap[doc.status] || doc.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StatementApprovalPanel;
