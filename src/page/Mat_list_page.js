import WorkspaceLayout from '../layout/WorkspaceLayout';
import ProductList from '../component/Product_list';
export default function MaterialListPage() {
  return <WorkspaceLayout title="자재목록" className="ws-materials-page"><ProductList /></WorkspaceLayout>;
}
