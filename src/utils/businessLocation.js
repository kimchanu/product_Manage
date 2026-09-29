// UI state always uses full names. Legacy values belong only at API boundaries.
const entries = [
  ['GK', 'GK사업소'], ['CM', '천마사업소'], ['ES', '을숙도사업소'],
  ['KN', '강남사업소'], ['SW', '수원사업소'],
];
export const businessLocations = entries.map(([, name]) => name);
export const accountLocations = [...businessLocations, '본사'];
export function normalizeLocation(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (trimmed.toUpperCase() === 'GN' || trimmed === '강남순환사업소') return '강남사업소';
  return entries.find(([code, name]) => code === trimmed.toUpperCase() || name.toLowerCase() === trimmed.toLowerCase())?.[1] || trimmed;
}
export const normalizeUserLocation = (user) => ({ ...user, business_location: normalizeLocation(user?.business_location) });
export const toApprovalLocation = (value) => entries.find(([, name]) => name === normalizeLocation(value))?.[0] || normalizeLocation(value);
// User-based endpoints historically preserve stored aliases, except GK's full name.
export const legacyUserLocation = (value) => value === 'GK사업소' ? 'GK' : value;
// Explicit selections use the report API's existing full-name convention outside GK.
export const reportLocation = (value, storedValue) => {
  if (storedValue && normalizeLocation(storedValue) === normalizeLocation(value)) return legacyUserLocation(storedValue);
  return normalizeLocation(value) === 'GK사업소' ? 'GK' : normalizeLocation(value);
};
// The original upload/material selector uses codes for these three sites only.
export const importLocation = (value) => {
  const name = normalizeLocation(value);
  return entries.slice(0, 3).find(([, label]) => label === name)?.[0] || name;
};

export function approvalRequest(path, options = {}) {
  const queryIndex = path.indexOf('?');
  const pathname = queryIndex < 0 ? path : path.slice(0, queryIndex);
  const params = new URLSearchParams(queryIndex < 0 ? '' : path.slice(queryIndex + 1));
  if (params.has('businessLocation')) params.set('businessLocation', toApprovalLocation(params.get('businessLocation')));
  let body = options.body;
  if (typeof body === 'string') {
    const parsed = JSON.parse(body);
    if (parsed.businessLocation !== undefined) parsed.businessLocation = toApprovalLocation(parsed.businessLocation);
    body = JSON.stringify(parsed);
  }
  return { path: pathname + (params.toString() ? `?${params}` : ''), options: { ...options, ...(body === undefined ? {} : { body }) } };
}
