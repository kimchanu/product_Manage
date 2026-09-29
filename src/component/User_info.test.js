import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import UserInfo from './User_info';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode', () => ({ jwtDecode: jest.fn() }));
let root;
let container;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.setItem('authToken', 'unchanged-token');
  container = document.createElement('div');
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  localStorage.clear();
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

test.each([
  ['GK사업소', 'GK사업소', 'GK'],
  ['GK', 'GK사업소', 'GK'],
  ['CM', '천마사업소', 'CM'],
  ['천마사업소', '천마사업소', '천마사업소'],
  ['ES', '을숙도사업소', 'ES'],
  ['KN', '강남사업소', 'KN'],
  ['SW', '수원사업소', 'SW'],
  ['본사', '본사', '본사'],
])('login location %s has canonical display and separate legacy request key', async (stored, display, request) => {
  jwtDecode.mockReturnValue({ user_id: 1, full_name: '테스트', business_location: stored, department: 'ITS', admin: 1, exp: 9999999999 });
  const setUser = jest.fn();
  await act(async () => root.render(<UserInfo setUser={setUser} />));
  expect(setUser).toHaveBeenCalledWith({ user_id: 1, name: '테스트', business_location: display, apiBusinessLocation: request, department: 'ITS', admin: 1 });
  expect(localStorage.getItem('authToken')).toBe('unchanged-token');
});
