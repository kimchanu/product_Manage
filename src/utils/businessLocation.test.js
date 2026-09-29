import {
  businessLocations, accountLocations, normalizeLocation, normalizeUserLocation,
  toApprovalLocation, reportLocation, importLocation, legacyUserLocation, approvalRequest,
} from './businessLocation';

const sites = [
  ['GK', 'GK사업소', 'GK', 'GK'],
  ['CM', '천마사업소', '천마사업소', 'CM'],
  ['ES', '을숙도사업소', '을숙도사업소', 'ES'],
  ['KN', '강남사업소', '강남사업소', '강남사업소'],
  ['SW', '수원사업소', '수원사업소', '수원사업소'],
];

test.each(sites)('%s uses full names in UI and preserves distinct API contracts', (code, name, report, upload) => {
  expect(normalizeLocation(code)).toBe(name);
  expect(normalizeLocation(` ${code.toLowerCase()} `)).toBe(name);
  expect(normalizeLocation(name)).toBe(name);
  expect(toApprovalLocation(name)).toBe(code);
  expect(toApprovalLocation(code)).toBe(code);
  expect(reportLocation(name)).toBe(report);
  expect(importLocation(name)).toBe(upload);
  expect(legacyUserLocation(code)).toBe(code);
  expect(legacyUserLocation(name)).toBe(report);
  expect(reportLocation(name, code)).toBe(code);
});

test('canonical selection lists contain names, with headquarters only for accounts', () => {
  expect(businessLocations).toEqual(sites.map(([, name]) => name));
  expect(accountLocations).toEqual([...businessLocations, '본사']);
  expect(normalizeLocation('본사')).toBe('본사');
});

test.each([undefined, null, 1, {}])('invalid value %s does not fabricate a site', value => {
  expect(normalizeLocation(value)).toBe('');
});

test('known historical aliases normalize without rewriting unknown names', () => {
  expect(normalizeLocation('GN')).toBe('강남사업소');
  expect(normalizeLocation('강남순환사업소')).toBe('강남사업소');
  expect(normalizeLocation(' 신규사업소 ')).toBe('신규사업소');
  expect(reportLocation('천마사업소', 'GK')).toBe('천마사업소');
});

test('normalizing login display leaves original token data and unrelated fields intact', () => {
  const raw = { business_location: 'ES', department: 'ITS', admin: 1, user_id: 9 };
  expect(normalizeUserLocation(raw)).toEqual({ ...raw, business_location: '을숙도사업소' });
  expect(raw.business_location).toBe('ES');
});

test.each(sites)('%s approval queries and draft bodies retain stored codes', (code, name) => {
  const body = { businessLocation: name, title: 'GK-2026-0001', department: 'ITS', recipients: [1], content: name };
  const options = { method: 'POST', body: JSON.stringify(body), headers: { 'X-Test': 'test' } };
  const request = approvalRequest(`/workspace/drafts?businessLocation=${encodeURIComponent(name)}&year=2026`, options);
  const params = new URLSearchParams(request.path.split('?')[1]);
  expect(params.get('businessLocation')).toBe(code);
  expect(params.get('year')).toBe('2026');
  expect(JSON.parse(request.options.body)).toEqual({ ...body, businessLocation: code });
  expect(request.options.method).toBe('POST');
  expect(request.options.headers).toEqual(options.headers);
  expect(JSON.parse(options.body)).toEqual(body);
  expect(approvalRequest(request.path, request.options)).toEqual(request);
});

test('requests without locations keep their path and payload', () => {
  expect(approvalRequest('/workspace/documents/7/read', { method: 'POST' })).toEqual({
    path: '/workspace/documents/7/read', options: { method: 'POST' },
  });
  expect(approvalRequest('/workspace/drafts?year=2026').path).toBe('/workspace/drafts?year=2026');
});
