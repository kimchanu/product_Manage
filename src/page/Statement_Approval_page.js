import React, { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import Header from '../layout/Header';
import ApprovalWorkspace from '../component/Approval/ApprovalWorkspace';
import '../component/Approval/ApprovalWorkspace.css';

export default function StatementApprovalPage() {
  const user = useMemo(() => {
    try {
      const decoded = jwtDecode(localStorage.getItem('authToken'));
      return { ...decoded, user_id: decoded.user_id || decoded.id, name: decoded.full_name };
    } catch { return null; }
  }, []);
  return <div className="approval-app"><Header hidePlaceholders />{user && <ApprovalWorkspace user={user} />}</div>;
}
