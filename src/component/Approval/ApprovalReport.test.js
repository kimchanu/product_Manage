import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ApprovalReport from './ApprovalReport';
import ApprovalComposer, { ApprovalTemplates } from './ApprovalComposer';

jest.mock('./ApprovalDialog', () => ({ children }) => <div>{children}</div>);

let container;
let root;
const originalFetch = global.fetch;
const props = { businessLocation: 'GK', department: 'ITS', year: 2026, month: 9 };
const report = { byCategory: { TCS: { prevStock: 1000, input: 300, output: 100, remaining: 1200 }, '합 계': { prevStock: 1000, input: 300, output: 100, remaining: 1200 } }, yearTotalInputAmount: 2500 };
const response = (data, ok = true) => ({ ok, json: async () => data });
const render = async (element) => { await act(async () => { root.render(element); }); };

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  global.fetch = jest.fn(async (url) => {
    if (url.includes('/api/budget')) return response({ budget: [{ site: 'GK사업소', department: 'ITS', amount: 10000 }] });
    if (url.includes('/meta?')) return response({ setting: { approver_name: '결재자' } });
    if (url.includes('/recipients?')) return response({ users: [] });
    return response(report);
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  global.fetch = originalFetch;
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

test('template folders omit common forms and select the monthly materials report', async () => {
  const onSelect = jest.fn();
  await render(<ApprovalTemplates onSelect={onSelect} onClose={() => {}} />);
  expect(container.textContent).not.toContain('공통양식');
  expect(container.textContent).toContain('자재수불명세서 월간보고서');
  await act(async () => container.querySelector('.ap-title-link').click());
  expect(onSelect).toHaveBeenCalledTimes(1);
});

test('composer displays monthly report without a preview checkbox', async () => {
  await render(<ApprovalComposer user={{ name: '작성자', department: 'ITS', admin: 1 }} businessLocation="GK" onClose={() => {}} onSaved={() => {}} />);
  expect(container.querySelector('[aria-label="자재수불명세서 월간보고서"]')).not.toBeNull();
  expect(container.textContent).not.toContain('보고서 미리보기');
});

test('monthly report contains stock rows and budget execution using selected site and department', async () => {
  await render(<ApprovalReport {...props} />);
  expect(container.textContent).toContain('2026년 09월 · GK사업소 · ITS');
  expect(container.querySelector('[aria-label="월간 자재수불 내역"]').textContent).toContain('1,200');
  const budget = container.querySelector('[aria-label="월간 예산집행 현황"]').textContent;
  expect(budget).toContain('10,000');
  expect(budget).toContain('7,500');
  expect(budget).toContain('25.0%');
});

test('period and department changes request matching report categories', async () => {
  await render(<ApprovalReport {...props} />);
  await render(<ApprovalReport {...props} businessLocation="CM" department="시설" month={8} />);
  const [, request] = global.fetch.mock.calls.filter(([url]) => url.endsWith('/api/statement')).pop();
  expect(JSON.parse(request.body)).toEqual({ businessLocation: '천마사업소', department: '시설', year: 2026, month: 8, categories: ['안전', '장비', '시설보수', '조경', '기타', '합 계'] });
  expect(container.textContent).toContain('2026년 08월 · 천마사업소 · 시설');
});

test('budget lookup failure leaves stock report visible without invented zero budget', async () => {
  global.fetch.mockImplementation(async (url) => url.includes('/api/budget') ? response({}, false) : response(report));
  await render(<ApprovalReport {...props} />);
  expect(container.querySelector('[aria-label="월간 자재수불 내역"]')).not.toBeNull();
  expect(container.querySelector('[aria-label="월간 예산집행 현황"]')).toBeNull();
  expect(container.querySelector('[role="alert"]').textContent).toContain('예산 데이터를 불러오지 못했습니다.');
});

test('invalid period clears the report without requesting invalid data', async () => {
  await render(<ApprovalReport {...props} />);
  global.fetch.mockClear();
  await render(<ApprovalReport {...props} year={0} />);
  expect(global.fetch).not.toHaveBeenCalled();
  expect(container.querySelector('.ap-report')).toBeNull();
  expect(container.textContent).toContain('보고 기간과 부서를 확인해 주세요.');
});
