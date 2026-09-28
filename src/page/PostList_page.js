import WorkspaceLayout from '../layout/WorkspaceLayout';
import PostList from '../component/Post/PostList';
export default function PostListPage() {
  return <WorkspaceLayout title="게시판" className="ws-posts-page"><PostList /></WorkspaceLayout>;
}
