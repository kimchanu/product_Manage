import React, { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SITE_OPTIONS = [
  "GK",
  "\uCC9C\uB9C8\uC0AC\uC5C5\uC18C",
  "\uC744\uC219\uB3C4\uC0AC\uC5C5\uC18C",
  "\uAC15\uB0A8\uC0AC\uC5C5\uC18C",
  "\uC218\uC6D0\uC0AC\uC5C5\uC18C",
];

const DEPARTMENT_OPTIONS = ["ITS", "\uAE30\uC804", "\uC2DC\uC124"];

const moneyFormatter = (value) =>
  Number(value || 0).toLocaleString("ko-KR", {
    maximumFractionDigits: 0,
  });

function PredictionCenter() {
  const [businessLocation, setBusinessLocation] = useState("GK");
  const [department, setDepartment] = useState("ITS");
  const [summary, setSummary] = useState([]);
  const [predictionList, setPredictionList] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState(null);
  const [coverage, setCoverage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPredictionData() {
      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams({
          businessLocation,
          department,
          limit: "24",
        });

        const apiBase = process.env.REACT_APP_API_URL || "";

        const [summaryRes, listRes, historyRes, coverageRes] = await Promise.all([
          fetch(`${apiBase}/api/predictions/summary?${query.toString()}`),
          fetch(`${apiBase}/api/predictions?${query.toString()}`),
          fetch(
            `${apiBase}/api/predictions/history?businessLocation=${encodeURIComponent(
              businessLocation
            )}&department=${encodeURIComponent(department)}&monthsBack=16`
          ),
          fetch(`${apiBase}/api/predictions/coverage?monthsBack=16`),
        ]);

        if (!summaryRes.ok || !listRes.ok || !historyRes.ok || !coverageRes.ok) {
          throw new Error("예측 데이터를 불러오지 못했습니다.");
        }

        const [summaryData, listData, historyData, coverageData] =
          await Promise.all([
            summaryRes.json(),
            listRes.json(),
            historyRes.json(),
            coverageRes.json(),
          ]);

        if (!isMounted) return;

        setSummary(Array.isArray(summaryData) ? summaryData : []);
        setPredictionList(Array.isArray(listData) ? listData : []);
        setHistory(Array.isArray(historyData.history) ? historyData.history : []);
        setHistoryMeta(historyData);
        setCoverage(Array.isArray(coverageData.coverage) ? coverageData.coverage : []);
      } catch (fetchError) {
        if (!isMounted) return;
        setError(fetchError.message || "알 수 없는 오류가 발생했습니다.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPredictionData();

    return () => {
      isMounted = false;
    };
  }, [businessLocation, department]);

  const chartData = useMemo(
    () =>
      history.map((row) => ({
        month: String(row.month).slice(0, 7),
        inputAmount: Number(row.inputAmount || 0),
        outputAmount: Number(row.outputAmount || 0),
      })),
    [history]
  );

  const hasHistoryData = useMemo(
    () =>
      chartData.some(
        (row) => row.inputAmount !== 0 || row.outputAmount !== 0
      ),
    [chartData]
  );

  const summaryCards = useMemo(() => {
    const latestMonth = [...summary]
      .sort((a, b) => String(b.target_month).localeCompare(String(a.target_month)))
      .slice(0, 2);

    return latestMonth.map((item) => ({
      id: `${item.target_type}-${item.target_month}`,
      title:
        item.target_type === "input_amount"
          ? "다음 달 예상 입고금액"
          : "다음 달 예상 출고금액",
      month: item.target_month,
      predictedTotal: Number(item.predicted_total || 0),
      actualTotal: Number(item.actual_total || 0),
      predictionCount: Number(item.prediction_count || 0),
    }));
  }, [summary]);

  const selectedCoverage = useMemo(
    () =>
      coverage.find(
        (item) =>
          item.businessLocation === businessLocation &&
          item.department === department
      ) || null,
    [coverage, businessLocation, department]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">예측 분석</h1>
            <p className="mt-2 text-sm text-slate-600">
              최근 16개월 입출고 이력과 저장된 예측 결과를 확인합니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-slate-700">
              사업소
              <select
                value={businessLocation}
                onChange={(event) => setBusinessLocation(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              >
                {SITE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-slate-700">
              부서
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              >
                {DEPARTMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Python 배치 스크립트: <code>python server/python/generate_predictions.py</code>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">데이터 기준</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {history.length}개월
          </p>
          <p className="mt-2 text-sm text-slate-600">
            현재 선택한 사업소와 부서의 월별 입출고 이력입니다.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">신뢰도</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {historyMeta?.confidenceLevel || "-"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            12개월 이상이면 보통, 24개월 이상이면 높음으로 분류합니다.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">실제 이력 존재</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {selectedCoverage?.hasData ? "있음" : "없음"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            활동 월 {selectedCoverage?.activeMonths || 0}개월 / 최신 이력{" "}
            {selectedCoverage?.latestActiveMonth
              ? String(selectedCoverage.latestActiveMonth).slice(0, 7)
              : "-"}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              데이터 존재 현황
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              어떤 사업소와 부서 조합에 실제 월별 이력이 있는지 한 번에 확인합니다.
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-3 py-3">사업소</th>
                <th className="px-3 py-3">부서</th>
                <th className="px-3 py-3">이력 여부</th>
                <th className="px-3 py-3">활동 월 수</th>
                <th className="px-3 py-3">최신 이력 월</th>
                <th className="px-3 py-3">입고 합계</th>
                <th className="px-3 py-3">출고 합계</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((item) => {
                const isSelected =
                  item.businessLocation === businessLocation &&
                  item.department === department;

                return (
                  <tr
                    key={`${item.businessLocation}-${item.department}`}
                    className={`border-b border-slate-100 ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-3 py-3">{item.businessLocation}</td>
                    <td className="px-3 py-3">{item.department}</td>
                    <td className="px-3 py-3">
                      {item.hasData ? "있음" : "없음"}
                    </td>
                    <td className="px-3 py-3">{item.activeMonths}</td>
                    <td className="px-3 py-3">
                      {item.latestActiveMonth
                        ? String(item.latestActiveMonth).slice(0, 7)
                        : "-"}
                    </td>
                    <td className="px-3 py-3">{moneyFormatter(item.inputTotal)}원</td>
                    <td className="px-3 py-3">{moneyFormatter(item.outputTotal)}원</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {summaryCards.map((card) => (
          <div
            key={card.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {moneyFormatter(card.predictedTotal)}원
            </p>
            <div className="mt-3 text-sm text-slate-600">
              대상월 {String(card.month).slice(0, 7)} / 실제 반영{" "}
              {moneyFormatter(card.actualTotal)}원 / 결과 {card.predictionCount}건
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">월별 이력 추세</h2>
            <p className="mt-1 text-sm text-slate-600">
              최근 16개월의 실제 입고금액과 출고금액을 비교합니다.
            </p>
          </div>
        </div>

        <div className="mt-6 h-80">
          {loading ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              데이터를 불러오는 중입니다.
            </div>
          ) : !hasHistoryData ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500">
              <p className="text-base font-medium">표시할 월별 실적이 없습니다.</p>
              <p className="mt-2 text-sm">
                현재 선택한 사업소와 부서 기준으로 최근 16개월 입출고 금액이 모두 0입니다.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                <Tooltip formatter={(value) => `${moneyFormatter(value)}원`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inputAmount"
                  name="입고금액"
                  stroke="#0f766e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="outputAmount"
                  name="출고금액"
                  stroke="#b45309"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">월별 이력 표</h2>
            <p className="mt-1 text-sm text-slate-600">
              차트 아래에서 같은 데이터를 숫자로 바로 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-3 py-3">월</th>
                <th className="px-3 py-3">입고금액</th>
                <th className="px-3 py-3">출고금액</th>
                <th className="px-3 py-3">입고 건수</th>
                <th className="px-3 py-3">출고 건수</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="px-3 py-3">{String(row.month).slice(0, 7)}</td>
                  <td className="px-3 py-3">{moneyFormatter(row.inputAmount)}원</td>
                  <td className="px-3 py-3">{moneyFormatter(row.outputAmount)}원</td>
                  <td className="px-3 py-3">{row.inputCount}</td>
                  <td className="px-3 py-3">{row.outputCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">예측 결과 목록</h2>
        <p className="mt-1 text-sm text-slate-600">
          Python 배치가 저장한 최근 예측값과 실제 반영 상태를 확인할 수 있습니다.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-3 py-3">예측 유형</th>
                <th className="px-3 py-3">기준월</th>
                <th className="px-3 py-3">대상월</th>
                <th className="px-3 py-3">예측값</th>
                <th className="px-3 py-3">실제값</th>
                <th className="px-3 py-3">모델</th>
                <th className="px-3 py-3">신뢰도</th>
                <th className="px-3 py-3">상태</th>
              </tr>
            </thead>
            <tbody>
              {predictionList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-3 py-8 text-center text-slate-400">
                    저장된 예측 결과가 없습니다. Python 배치를 먼저 실행해주세요.
                  </td>
                </tr>
              ) : (
                predictionList.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">{item.target_type}</td>
                    <td className="px-3 py-3">{String(item.base_month).slice(0, 7)}</td>
                    <td className="px-3 py-3">{String(item.target_month).slice(0, 7)}</td>
                    <td className="px-3 py-3">{moneyFormatter(item.predicted_value)}원</td>
                    <td className="px-3 py-3">
                      {item.actual_value == null
                        ? "-"
                        : `${moneyFormatter(item.actual_value)}원`}
                    </td>
                    <td className="px-3 py-3">{item.model_name}</td>
                    <td className="px-3 py-3">{item.confidence_level}</td>
                    <td className="px-3 py-3">{item.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PredictionCenter;
