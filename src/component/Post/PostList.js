import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PostList = ({ materialCode }) => {
    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [limit, setLimit] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchPosts();
    }, [currentPage, limit]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts?page=${currentPage}&limit=${limit}`);
            const data = await res.json();

            if (res.ok) {
                console.log("받아온 게시글 데이터:", data.posts);
                setPosts(data.posts);
                setPagination(data.pagination);
            } else {
                console.error("게시글 불러오기 실패:", data.error);
            }
        } catch (err) {
            console.error("게시글 불러오기 실패:", err);
            setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    const handleLimitChange = (e) => {
        setLimit(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();
        if (isToday) {
            // 오늘이면 시간만 표시 (HH:MM)
            return date.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } else {
            // 오늘이 아니면 날짜만 표시 (YYYY-MM-DD)
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }
    };

    if (loading) {
        return (
            <div className="p-4 max-w-7xl mx-auto">
                <div className="bg-white p-6 rounded-2xl shadow space-y-4 ml-4">
                    <div className="flex justify-center">
                        <p className="text-gray-500">게시글을 불러오는 중...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto mt-8 px-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">게시판</h2>
                <div className="flex items-center space-x-2">
                    <select
                        value={limit}
                        onChange={handleLimitChange}
                        className="px-2 py-1 border rounded-md text-sm"
                    >
                        <option value="10">10개</option>
                        <option value="20">20개</option>
                    </select>
                    <Link to="/WritePost" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                        글쓰기
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-2">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border-t border-b text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 w-16">말머리</th>
                            <th className="py-2 text-center">제목</th>
                            <th className="py-2 w-32">작성자</th>
                            <th className="py-2 w-32">날짜</th>
                            <th className="py-2 w-16">조회</th>
                            <th className="py-2 w-16">추천</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center text-gray-500 py-8">작성된 글이 없습니다.</td>
                            </tr>
                        ) : (
                            posts.map((post) => {
                                // 스타일 구분
                                let rowClass = "hover:bg-blue-50 cursor-pointer";
                                let titleClass = "";
                                if (post.is_top) {
                                    rowClass = "bg-yellow-50 border-l-4 border-yellow-400 hover:bg-yellow-100 cursor-pointer";
                                    titleClass = "font-bold text-yellow-700";
                                } else if (post.is_notice) {
                                    rowClass = "bg-blue-50 border-l-4 border-blue-400 hover:bg-blue-100 cursor-pointer";
                                    titleClass = "font-bold text-blue-700";
                                } else if (post.is_important) {
                                    rowClass = "bg-red-50 border-l-4 border-red-400 hover:bg-red-100 cursor-pointer";
                                    titleClass = "font-bold text-red-700";
                                }
                                return (
                                    <tr key={post.id} className={rowClass} onClick={() => window.location.href = `/posts/${post.id}`}>
                                        <td className="text-center">
                                            <span className="font-bold">
                                                {post.is_notice ? "공지" :
                                                    post.category === "question" ? "질문" :
                                                        post.category === "info" ? "정보" :
                                                            post.category === "guide" ? "가이드/팁" :
                                                                post.category === "trade" ? "중고거래" : "일반"}
                                            </span>
                                        </td>
                                        <td className={"text-center " + titleClass}>
                                            {post.title}
                                            {post.comment_count > 0 && (
                                                <span className="ml-2 text-gray-500 text-sm">[{post.comment_count}]</span>
                                            )}
                                        </td>
                                        <td className="text-center">{post.author}</td>
                                        <td className="text-center">{formatDate(post.created_at)}</td>
                                        <td className="text-center">{post.view_count}</td>
                                        <td className="text-center">{post.like_count}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            이전
                        </button>

                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const page = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + i;
                            if (page > pagination.totalPages) return null;

                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 border rounded-md ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === pagination.totalPages}
                            className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            다음
                        </button>
                    </div>
                </div>
            )}

            <div className="text-center text-sm text-gray-500 mt-4">
                총 {pagination.totalCount}개의 게시글
            </div>
        </div>
    );
};

export default PostList;