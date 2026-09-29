import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import { PieChart, Pie, Cell } from 'recharts';
import useInventoryTrend from './useInventoryTrend';
import { budgetPosition, departments, monthlyTotals, total, won } from './statisticsModel';
import { normalizeLocation } from '../../utils/businessLocation';
import './Statistics.css';

export default function InventorySummary({ defaultSite }) {
  const now = new Date();
  const site = normalizeLocation(defaultSite);
  const siteName = site;
  const stats = useInventoryTrend(site, now.getFullYear(), false, true);
  return <section className="portal-section stats-mini">
    <header><h2>{siteName} 파트별 예산 현황</h2><button className="ws-icon" title="예산 현황 새로고침" aria-label="예산 현황 새로고침" disabled={stats.loading} onClick={stats.refresh}><FiRefreshCw /></button><Link to={`/dashboard?site=${encodeURIComponent(site || '')}`}>상세 통계<FiChevronRight /></Link></header>
    <div className="stats-mini-body">
      <div className="stats-mini-heading"><span>{now.getFullYear()}년 1~{now.getMonth() + 1}월 누적</span><span>당월 집계 중</span></div>
      {stats.loading ? <p className="stats-placeholder" role="status">예산 현황을 불러오는 중...</p> : <>
        {stats.budgetError && <p className="stats-notice" role="alert">예산 조회 실패: {stats.budgetError}</p>}
        <div className="stats-site-budgets">{departments.map((department) => <DepartmentBudget key={department} name={department} stats={stats} budgetError={stats.budgetError} month={now.getMonth() + 1} />)}</div>
      </>}
    </div>
  </section>;
}

function DepartmentBudget({ name, stats, budgetError, month }) {
  const used = stats.current ? total(monthlyTotals(stats.current, name, month), 'input') : null;
  const amount = stats.budget?.find((item) => item.department === name)?.amount;
  const { budget, remaining, rate } = budgetPosition(budgetError ? null : amount, used ?? 0);
  const valid = !stats?.error && used !== null && budget !== null;
  const over = valid && remaining < 0;
  const chartReady = valid && rate !== null;
  const remainingRate = chartReady ? Math.max(0, 100 - rate) : null;
  const label = chartReady ? `${name} 예산 사용 ${rate.toFixed(1)}%, 잔여 ${remainingRate.toFixed(1)}%${over ? `, 초과 ${(rate - 100).toFixed(1)}%` : ''}` : `${name} 예산 비율 산정 불가`;
  const pieces = chartReady ? [
    { value: Math.max(0, Math.min(budget, used)), color: over ? '#b55c50' : '#497caa' },
    { value: Math.max(0, remaining), color: '#a7d3c5' },
  ] : [{ value: 1, color: '#e8edf1' }];
  const unavailable = stats?.error ? '구매액 조회 실패' : budgetError ? '예산 조회 실패' : budget === null ? `${name} 예산 미등록` : budget === 0 ? '예산 0원 · 비율 산정 불가' : '';
  return <section className="stats-site-budget" aria-label={`${name} 예산 현황`}>
    <div className="stats-site-title"><h3>{name}</h3><div><span>연간예산</span><strong>{budgetError ? '조회 실패' : budget === null ? '미등록' : won(budget)}</strong></div></div>
    <div className="stats-site-budget-body">
      <div className={`stats-budget-donut ${over ? 'is-over-budget' : ''}`} role="img" aria-label={label}>
        <PieChart width={112} height={112}><Pie data={pieces} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={53} startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>{pieces.map((piece, index) => <Cell key={index} fill={piece.color} />)}</Pie></PieChart>
        <div className="stats-donut-center" aria-hidden="true"><strong>{chartReady ? `${rate.toFixed(1)}%` : '-'}</strong><span>사용률</span></div>
      </div>
      <dl className="stats-site-budget-values"><div><dt><i />입고(구매)<small>{chartReady ? `${rate.toFixed(1)}%` : '-'}</small></dt><dd>{used === null || stats?.error ? '조회 실패' : won(used)}</dd></div><div className={over ? 'is-over-budget' : 'stats-site-remaining'}><dt><i />{over ? '예산 초과' : '잔여 예산'}<small>{chartReady ? `${(over ? rate - 100 : remainingRate).toFixed(1)}%` : '-'}</small></dt><dd>{!valid ? '-' : won(over ? -remaining : remaining)}</dd></div></dl>
    </div>
    {unavailable && <p className="stats-budget-unavailable" role={stats?.error ? 'alert' : 'status'}>{unavailable}</p>}
  </section>;
}
