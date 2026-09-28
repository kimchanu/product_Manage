import WorkspaceLayout from '../layout/WorkspaceLayout';
import AdminConsole from '../component/Admin/AdminConsole';
export default function AdminPage() {
  return <WorkspaceLayout title="관리자" className="ws-admin-page"><AdminConsole /></WorkspaceLayout>;
}
