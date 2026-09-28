import { useEffect, useState } from 'react';
import { normalizeLocation, reportLocation } from '../Approval/approvalApi';
import { normalizeTrend } from './statisticsModel';

export default function useInventoryTrend(site, year, detailed = false, includeBudget = detailed) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ loading: true, current: null, previous: null, budget: null, error: '', previousError: '', budgetError: '' });
  const siteCode = normalizeLocation(site);
  const key = `${siteCode}:${year}:${detailed}:${includeBudget}:${revision}`;
  useEffect(() => {
    const controller = new AbortController();
    const initial = { key, loading: true, current: null, previous: null, budget: null, error: '', previousError: '', budgetError: '' };
    setState(initial);
    const request = async (path, options = {}) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}${path}`, { ...options, signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `조회 실패 (${response.status})`);
      return data;
    };
    const trend = async (selectedYear) => normalizeTrend(await request('/api/statement/yearly-trend', { method: 'POST', body: JSON.stringify({ businessLocation: reportLocation(siteCode), year: selectedYear }) }));
    const run = async () => {
      const requests = [trend(year), detailed ? trend(year - 1) : Promise.resolve(null),
        includeBudget ? request(`/api/budget?year=${year}`).then((data) => {
        if (!Array.isArray(data.budget)) throw new Error('예산 응답 형식이 올바르지 않습니다.');
        return data.budget.filter((item) => normalizeLocation(item.site) === siteCode);
      }) : Promise.resolve(null)];
      const results = await Promise.allSettled(requests);
      if (controller.signal.aborted) return;
      const next = { ...initial, loading: false };
      ['current', 'previous', 'budget'].forEach((name, index) => {
        if (!results[index]) return;
        if (results[index].status === 'fulfilled') next[name] = results[index].value;
        else next[index === 0 ? 'error' : `${name}Error`] = results[index].reason.message || '통계를 불러오지 못했습니다.';
      });
      setState(next);
    };
    run();
    return () => controller.abort();
  }, [key, siteCode, year, detailed, includeBudget]);
  return { ...(state.key === key ? state : { loading: true, current: null, previous: null, budget: null, error: '' }), refresh: () => setRevision((value) => value + 1) };
}
