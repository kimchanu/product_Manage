import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiRefreshCw, FiArrowRight, FiTrendingUp, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { businessLocations, normalizeLocation } from '../utils/businessLocation';
import useInventoryTrend from './Statistics/useInventoryTrend';
import { FlowChart, CompareChart, DepartmentChart } from './Statistics/InventoryCharts';
import { departments, monthlyTotals, total, changeLabel, comparisonRows, budgetPosition, won } from './Statistics/statisticsModel';
import './Statistics/Statistics.css';

export default function Dashboard({ businessLocation: site, onSiteChange }) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const [year, setYear] = useState(currentMonth === 1 ? currentYear - 1 : currentYear);
  const [endMonth, setEndMonth] = useState(currentMonth === 1 ? 12 : currentMonth - 1);
  const [dept, setDept] = useState('전체');
  const [measure, setMeasure] = useState('input');
  const [cumulative, setCumulative] = useState(false);
  const selectedMonth = Math.min(endMonth, year === currentYear ? currentMonth : 12);
  const partial = year === currentYear && selectedMonth === currentMonth;
  const selectedSite = normalizeLocation(site);
  const siteName = selectedSite;
  const stats = useInventoryTrend(site, year, true);
  const rows = stats.current ? monthlyTotals(stats.current, dept, selectedMonth) : [];
  const previous = stats.previous ? monthlyTotals(stats.previous, dept, selectedMonth) : [];
  const input = total(rows, 'input');
  const output = total(rows, 'output');
  const selectedDepartments = dept === '전체' ? departments : [dept];
  const byDept = stats.current ? selectedDepartments.map((name) => {
    const monthly = monthlyTotals(stats.current, name, selectedMonth);
    const matched = !stats.budgetError && stats.budget?.find((item) => item.department === name);
    const deptInput = total(monthly, 'input');
    return { name, input: deptInput, output: total(monthly, 'output'), ...budgetPosition(matched?.amount, deptInput) };
  }) : [];
  const hasBudget = byDept.length > 0 && byDept.every((item) => item.budget !== null);
  const budgetTotal = hasBudget ? total(byDept, 'budget') : null;
  const budgetRate = budgetTotal ? input / budgetTotal * 100 : null;
  const remainingBudget = budgetTotal === null ? null : budgetTotal - input;
  const selectedLabel = measure === 'input' ? '입고' : '출고';
  const latest = rows.at(-1);
  const preceding = rows.length > 1 ? rows.at(-2) : (stats.previous ? monthlyTotals(stats.previous, dept).at(-1) : null);
  const peak = rows.reduce((best, row) => !best || row[measure] > best[measure] ? row : best, null);
  const largest = byDept.reduce((best, item) => !best || item.output > best.output ? item : best, null);
  const period = `${year}년 1~${selectedMonth}월`;
  const compareCaption = stats.previousError ? '전년 조회 실패' : partial ? '당월 집계 중 · 전년 비교 보류' : `전년 동기간 ${changeLabel(input, total(previous, 'input'))}`;

  return <div className="inventory-dashboard">
    <div className="stats-filterbar">
      <div className="stats-title"><FiBarChart2 /><div><h2>입출고 통계</h2><span>{siteName} · {period}{partial ? ' · 당월 집계 중' : ''}</span></div></div>
      <div className="stats-filters">
        <label>사업소<select aria-label="통계 사업소" value={selectedSite} onChange={(event) => onSiteChange(event.target.value)}>
          {!businessLocations.includes(selectedSite) && <option value={selectedSite}>{siteName}</option>}
          {businessLocations.map(name => <option value={name} key={name}>{name}</option>)}
        </select></label>
        <label>연도<select aria-label="통계 연도" value={year} onChange={(event) => { const next = Number(event.target.value); setYear(next); setEndMonth((month) => Math.min(month, next === currentYear ? currentMonth : 12)); }}>{Array.from({ length: 6 }, (_, index) => currentYear - index).map((value) => <option key={value} value={value}>{value}년</option>)}</select></label>
        <label>집계 기간<select aria-label="집계 종료월" value={selectedMonth} onChange={(event) => setEndMonth(Number(event.target.value))}>{Array.from({ length: year === currentYear ? currentMonth : 12 }, (_, index) => index + 1).map((month) => <option key={month} value={month}>1~{month}월{year === currentYear && month === currentMonth ? ' (집계 중)' : ''}</option>)}</select></label>
        <button className="ws-icon" aria-label="통계 새로고침" title="통계 새로고침" onClick={stats.refresh} disabled={stats.loading}><FiRefreshCw /></button>
      </div>
    </div>
    <nav className="ws-tabs stats-dept-tabs" aria-label="통계 부서">{['전체', ...departments].map((name) => <button key={name} aria-pressed={dept === name} onClick={() => setDept(name)}>{name}</button>)}</nav>
    {stats.loading ? <p role="status" className="stats-placeholder">통계를 불러오는 중...</p> : stats.error ? <div className="ws-error" role="alert">{stats.error}<button className="ws-button" onClick={stats.refresh}>다시 조회</button></div> : <>
      <div className="stats-kpis">
        <Metric title="누적 입고액" value={won(input)} caption={compareCaption} tone="input" />
        <Metric title="누적 출고액" value={won(output)} caption={stats.previousError ? '전년 조회 실패' : partial ? '당월 집계 중 · 전년 비교 보류' : `전년 동기간 ${changeLabel(output, total(previous, 'output'))}`} tone="output" />
        <Metric title="연간예산 대비 입고" value={stats.budgetError ? '조회 실패' : budgetTotal === null ? '예산 미등록' : budgetRate === null ? '-' : `${budgetRate.toFixed(1)}%`} caption={budgetTotal !== null ? `연간예산 ${won(budgetTotal)}` : '선택 부서의 연간예산 기준'} tone="budget" />
        <Metric title="잔여 예산" value={stats.budgetError ? '조회 실패' : remainingBudget === null ? '예산 미등록' : won(remainingBudget)} caption={remainingBudget !== null && remainingBudget < 0 ? `${selectedMonth}월까지 구매 기준 · 예산 ${won(-remainingBudget)} 초과` : `연간예산 − 1~${selectedMonth}월 입고(구매) 누계`} tone={remainingBudget !== null && remainingBudget < 0 ? 'over-budget' : 'remaining'} />
      </div>
      {rows.every((row) => !row.input && !row.output) && <p className="stats-notice" role="status">선택한 기간에 등록된 입출고 실적이 없습니다.</p>}
      <div className="stats-insights" aria-label="통계 요약">
        <Insight icon={FiTrendingUp} title={`${selectedMonth}월 ${selectedLabel}`} value={partial ? '당월 집계 중' : preceding ? `전월 대비 ${changeLabel(latest?.[measure] || 0, preceding[measure])}` : '전월 조회 실패'} detail={won(latest?.[measure])} />
        <Insight icon={FiBarChart2} title={`${selectedLabel} 최대 월`} value={peak?.[measure] ? `${peak.month}월 · ${won(peak[measure])}` : '등록된 실적 없음'} detail={partial ? '집계 중인 당월 포함' : `${selectedMonth}개월 비교`} />
        <Insight icon={FiPieChart} title="출고 비중" value={output > 0 && largest ? `${largest.name} ${((largest.output / output) * 100).toFixed(1)}%` : '등록된 실적 없음'} detail={dept === '전체' ? '선택 기간 내 최다 출고 부서' : `${dept} 부서만 집계`} />
      </div>
      <div className="stats-chart-grid">
        <ChartSection title="월별 입출고" subtitle={`${dept} · 월별 금액`}><FlowChart rows={rows} /></ChartSection>
        <ChartSection title="전년 동기간 비교" subtitle={partial ? '당월은 부분 집계' : `${year - 1}년 / ${year}년`} actions={<div className="stats-chart-controls"><div className="ws-segmented">{[['input', '입고'], ['output', '출고']].map(([key, label]) => <button key={key} aria-pressed={measure === key} onClick={() => setMeasure(key)}>{label}</button>)}</div><label><input type="checkbox" checked={cumulative} onChange={(event) => setCumulative(event.target.checked)} />누적</label></div>}>
          {stats.previousError ? <p role="alert" className="stats-placeholder">전년 통계를 불러오지 못했습니다.<button className="ws-button" onClick={stats.refresh}>다시 조회</button></p> : <CompareChart rows={comparisonRows(rows, previous, measure, cumulative)} year={year} />}
        </ChartSection>
        <ChartSection title="부서별 입출고" subtitle={`${period} 누적`}><DepartmentChart rows={byDept} /></ChartSection>
      </div>
      <section className="stats-budget-section">
        <header><h2>부서별 예산 · 실적</h2><span>{period} · 단위: 원</span><Link to="/Statement_page">수불명세서<FiArrowRight /></Link></header>
        {stats.budgetError && <p className="ws-error" role="alert">예산 조회 실패: {stats.budgetError}</p>}
        <div className="ws-scroll"><table><thead><tr><th>부서</th><th>연간예산</th><th>누적 입고액</th><th>누적 출고액</th><th>잔여 예산</th><th>예산 대비 입고</th></tr></thead><tbody>{byDept.map((item) => <tr key={item.name}><td>{item.name}</td><td>{stats.budgetError ? '조회 실패' : item.budget !== null ? won(item.budget) : '미등록'}</td><td>{won(item.input)}</td><td>{won(item.output)}</td><td className={item.remaining !== null && item.remaining < 0 ? 'stats-remaining over-budget' : 'stats-remaining'}>{stats.budgetError ? '조회 실패' : item.remaining === null ? '미등록' : won(item.remaining)}</td><td><div className="stats-budget-rate">{item.rate === null ? '-' : <><span className={item.rate > 100 ? 'over-budget' : ''}>{item.rate.toFixed(1)}%</span><progress max="100" value={Math.max(0, Math.min(100, item.rate))} aria-label={`${item.name} 예산 대비 입고 ${item.rate.toFixed(1)}%`} /></>}</div></td></tr>)}</tbody></table></div>
      </section>
    </>}
  </div>;
}

function Metric({ title, value, caption, tone }) {
  return <section className={`stats-kpi stats-kpi-${tone}`}><h3>{title}</h3><strong>{value}</strong><p>{caption}</p></section>;
}
function Insight({ icon: Icon, title, value, detail }) {
  return <div className="stats-insight"><Icon /><div><h3>{title}</h3><strong>{value}</strong><p>{detail}</p></div></div>;
}
function ChartSection({ title, subtitle, actions, children }) {
  return <section className="stats-chart-section"><header><div><h3>{title}</h3><p>{subtitle}</p></div>{actions}<span className="stats-unit">단위: 만원</span></header>{children}</section>;
}
