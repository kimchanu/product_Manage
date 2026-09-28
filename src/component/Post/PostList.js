import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiRefreshCw, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const fetchPosts = useCallback(async (signal) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts?page=${currentPage}&limit=${limit}`, { signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '게시글을 불러오지 못했습니다.');
      if (!signal?.aborted) { setPosts(data.posts || []); setPagination(data.pagination || {}); }
    } catch (err) { if (!signal?.aborted) setError(err.message); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [currentPage, limit]);
  useEffect(() => { const controller = new AbortController(); fetchPosts(controller.signal); return () => controller.abort(); }, [fetchPosts]);
  const totalPages = Math.max(1, Number(pagination.totalPages || 1));
  const changePage = (next) => setCurrentPage(Math.max(1, Math.min(next, totalPages)));
  const formatDate = (value) => new Date(value).toLocaleDateString('ko-KR');
  const categories = { question: '질문', info: '정보', guide: '가이드/팁', trade: '중고거래', general: '일반' };
  return <div>
    <div className="ws-section-toolbar"><span className="font-semibold">전체 게시글</span><span className="text-gray-500 text-xs">{pagination.totalCount || 0}건</span><div className="ml-auto flex gap-2"><button className="ws-icon" aria-label="게시글 새로고침" title="새로고침" disabled={loading} onClick={() => fetchPosts()}><FiRefreshCw /></button><Link to="/WritePost" className="ws-button ws-button-primary"><FiEdit />글쓰기</Link></div></div>
    {error && <div role="alert" className="ws-error">{error}<button className="ws-button" onClick={() => fetchPosts()}>다시 시도</button></div>}
    <div className="ws-table-frame"><table className="ws-post-table"><colgroup><col style={{ width: 90 }} /><col /><col style={{ width: 110 }} /><col style={{ width: 130 }} /><col style={{ width: 60 }} /><col style={{ width: 60 }} /></colgroup><thead><tr><th>말머리</th><th>제목</th><th>작성자</th><th>날짜</th><th>조회</th><th>추천</th></tr></thead>
      <tbody>{loading ? <tr><td colSpan={6} className="ws-empty" role="status">게시글을 불러오는 중입니다.</td></tr> : posts.length ? posts.map((post) => <tr key={post.id} className={post.is_top ? 'bg-yellow-50' : post.is_notice ? 'bg-blue-50' : post.is_important ? 'bg-red-50' : ''}>
        <td className="text-center"><span className={post.is_notice ? 'text-blue-700 font-semibold' : post.is_important ? 'text-red-700' : 'text-gray-500'}>{post.is_notice ? '공지' : post.is_important ? '중요' : categories[post.category] || '일반'}</span></td>
        <td><Link className="ws-post-title" to={`/posts/${post.id}`}>{post.title}{Number(post.comment_count) > 0 && <span className="text-gray-400 ml-2">[{post.comment_count}]</span>}</Link></td>
        <td className="text-center">{post.author}</td><td className="text-center text-gray-500">{formatDate(post.created_at)}</td><td className="text-center">{post.view_count || 0}</td><td className="text-center">{post.like_count || 0}</td>
      </tr>) : <tr><td colSpan={6} className="ws-empty">작성된 글이 없습니다.</td></tr>}</tbody>
    </table></div>
    <div className="ws-pagination"><label>목록건수<select aria-label="게시글 목록건수" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}><option value={10}>10</option><option value={20}>20</option></select></label><div>
      <button className="ws-icon" title="첫 페이지" aria-label="첫 페이지" disabled={currentPage === 1 || loading} onClick={() => changePage(1)}><FiChevronsLeft /></button><button className="ws-icon" title="이전 페이지" aria-label="이전 페이지" disabled={currentPage === 1 || loading} onClick={() => changePage(currentPage - 1)}><FiChevronLeft /></button>
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i).map((page) => <button key={page} className={`ws-icon ${page === currentPage ? 'active' : ''}`} aria-current={page === currentPage ? 'page' : undefined} aria-label={`${page}페이지`} disabled={loading} onClick={() => changePage(page)}>{page}</button>)}
      <button className="ws-icon" title="다음 페이지" aria-label="다음 페이지" disabled={currentPage >= totalPages || loading} onClick={() => changePage(currentPage + 1)}><FiChevronRight /></button><button className="ws-icon" title="마지막 페이지" aria-label="마지막 페이지" disabled={currentPage >= totalPages || loading} onClick={() => changePage(totalPages)}><FiChevronsRight /></button>
    </div><span>현재 {currentPage}/{totalPages} · 총 {pagination.totalCount || 0}건</span></div>
  </div>;
}
