import React, { useState } from 'react';
import { FiLock } from 'react-icons/fi';
import UserInfo from './User_info';
import WorkspaceDialog from './WorkspaceDialog';

export default function Mypage() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  return <section className="ws-profile">
    <UserInfo setUser={setUser} />
    <header><h2>프로필 정보</h2><button className="ws-button" onClick={() => { setMessage(''); setOpen(true); }} disabled={!user}><FiLock />비밀번호 변경</button></header>
    {message && <p role="status" className="py-3 text-green-700">{message}</p>}
    <dl><dt>이름</dt><dd>{user?.name || '-'}</dd><dt>사업소</dt><dd>{user?.business_location || '-'}</dd><dt>부서</dt><dd>{user?.department || '-'}</dd><dt>권한</dt><dd>{Number(user?.admin) >= 1 ? '관리자' : '일반 회원'}</dd></dl>
    {open && <ChangePassword onClose={() => setOpen(false)} onSaved={() => { setOpen(false); setMessage('비밀번호가 변경되었습니다.'); }} />}
  </section>;
}

function ChangePassword({ onClose, onSaved }) {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (values.newPassword !== values.confirmPassword) { setError('새 비밀번호가 일치하지 않습니다.'); return; }
    setBusy(true); setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/change-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '비밀번호를 변경하지 못했습니다.');
      onSaved();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <WorkspaceDialog title="비밀번호 변경" onClose={onClose} busy={busy}><form onSubmit={submit}>
    {[['currentPassword', '현재 비밀번호'], ['newPassword', '새 비밀번호'], ['confirmPassword', '새 비밀번호 확인']].map(([key, label]) => <label key={key}>{label}<input type="password" autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'} required minLength={key === 'currentPassword' ? 1 : 4} disabled={busy} value={values[key]} onChange={(e) => setValues({ ...values, [key]: e.target.value })} /></label>)}
    {error && <p role="alert" className="ws-dialog-message">{error}</p>}
    <div className="ws-dialog-actions"><button type="button" className="ws-button" disabled={busy} onClick={onClose}>취소</button><button type="submit" className="ws-button ws-button-primary" disabled={busy}>{busy ? '변경 중...' : '변경하기'}</button></div>
  </form></WorkspaceDialog>;
}
