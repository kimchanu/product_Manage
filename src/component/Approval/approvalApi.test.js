import { approvalApi } from './approvalApi';

afterEach(() => { jest.restoreAllMocks(); localStorage.clear(); });

test('drafts return UI names while document identifiers keep their original prefix', async () => {
  localStorage.setItem('authToken', 'test-token');
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({
    drafts: [{ id: 1, businessLocation: 'CM' }],
    documents: [{ id: 2, business_location: 'CM', report_year: 2026 }],
  }) });
  const data = await approvalApi('/workspace/drafts?businessLocation=천마사업소');
  expect(fetchMock.mock.calls[0][0]).toContain('businessLocation=CM');
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer test-token');
  expect(data.drafts[0].businessLocation).toBe('천마사업소');
  expect(data.documents[0].business_location).toBe('CM');
});

test('saving a canonical UI draft sends the approval code and preserves content', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) });
  await approvalApi('/workspace/drafts', { method: 'POST', body: JSON.stringify({ businessLocation: '을숙도사업소', title: '월간보고서' }) });
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ businessLocation: 'ES', title: '월간보고서' });
});
