import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { axisAmount, won } from './statisticsModel';
export const INPUT_COLOR = '#497caa';
export const OUTPUT_COLOR = '#469381';
const tooltip = { formatter: (value) => won(value), contentStyle: { fontSize: 12, borderColor: '#cdd3d9', borderRadius: 3 } };
const axis = { tick: { fontSize: 11, fill: '#7d8790' }, axisLine: false, tickLine: false };
const grid = <CartesianGrid vertical={false} stroke="#e8edf1" strokeDasharray="3 3" />;
export function FlowChart({ rows, compact = false }) {
  return <div className={`stats-chart ${compact ? 'stats-chart-compact' : ''}`} role="img" aria-label="월별 입고·출고 금액 막대그래프"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} margin={{ top: 12, right: 8, bottom: 0, left: 0 }} barGap={3}>
    {grid}<XAxis dataKey="label" {...axis} /><YAxis {...axis} width={55} tickFormatter={axisAmount} /><Tooltip {...tooltip} /><Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
    <Bar dataKey="input" name="입고" fill={INPUT_COLOR} maxBarSize={24} isAnimationActive={false} /><Bar dataKey="output" name="출고" fill={OUTPUT_COLOR} maxBarSize={24} isAnimationActive={false} />
  </BarChart></ResponsiveContainer></div>;
}
export function CompareChart({ rows, year }) {
  return <div className="stats-chart" role="img" aria-label="전년 대비 금액 추이"><ResponsiveContainer width="100%" height="100%"><LineChart data={rows} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
    {grid}<XAxis dataKey="label" {...axis} /><YAxis {...axis} width={55} tickFormatter={axisAmount} /><Tooltip {...tooltip} /><Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
    <Line dataKey="previous" name={`${year - 1}년`} stroke="#a5aeb8" strokeDasharray="5 4" strokeWidth={2} dot={false} isAnimationActive={false} />
    <Line dataKey="current" name={`${year}년`} stroke={INPUT_COLOR} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
  </LineChart></ResponsiveContainer></div>;
}
export function DepartmentChart({ rows }) {
  return <div className="stats-chart" role="img" aria-label="부서별 누적 입출고 비교"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} layout="vertical" margin={{ top: 10, right: 18, bottom: 0, left: 0 }}>
    <CartesianGrid horizontal={false} stroke="#e8edf1" strokeDasharray="3 3" /><XAxis type="number" {...axis} tickFormatter={axisAmount} /><YAxis dataKey="name" type="category" {...axis} width={42} /><Tooltip {...tooltip} /><Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
    <Bar dataKey="input" name="입고" fill={INPUT_COLOR} maxBarSize={20} isAnimationActive={false} /><Bar dataKey="output" name="출고" fill={OUTPUT_COLOR} maxBarSize={20} isAnimationActive={false} />
  </BarChart></ResponsiveContainer></div>;
}
