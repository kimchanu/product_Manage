import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Header from "../../layout/Header";
import Footer from "../../layout/Footer";

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userReaction, setUserReaction] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [commentAuthor, setCommentAuthor] = useState("");
    const [userId, setUserId] = useState(null);
    const [isAdmin, setIsAdmin] = useState(0);

    // 사용자 정보 가져오기
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCommentAuthor(decoded.full_name);
                setUserId(decoded.user_id);
                setIsAdmin(decoded.is_admin);
            } catch (error) {
                console.error("토큰 디코딩 오류:", error);
            }
        }
    }, []);

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [id]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${id}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const text = await res.text();
            if (!text) throw new Error("Empty response from server");
            const data = JSON.parse(text);
            setPost(data);
        } catch (err) {
            setError(`게시글을 불러오는 중 오류가 발생했습니다: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${id}/comments`);
            const data = await res.json();
            if (res.ok) setComments(data.comments);
        } catch (err) {
            // ignore
        }
    };

    const handleReaction = async (reactionType) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${id}/reaction`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, reaction_type: reactionType }),
            });
            if (res.ok) {
                fetchPost();
                setUserReaction(userReaction === reactionType ? null : reactionType);
            }
        } catch (err) { }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }
        if (!commentAuthor.trim()) {
            alert("로그인이 필요합니다.");
            return;
        }
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment.trim(), author: commentAuthor.trim() }),
            });
            if (res.ok) {
                setNewComment("");
                fetchComments();
            }
        } catch (err) { }
    };

    // 게시글 삭제 함수
    const handleDelete = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
            });
            if (res.ok) {
                alert("게시글이 삭제되었습니다.");
                navigate("/PostList_page");
            } else {
                alert("삭제 권한이 없습니다.");
            }
        } catch (err) {
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    // 날짜 포맷: 오늘이면 시간, 아니면 날짜
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();
        if (isToday) {
            return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
        } else {
            return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        }
    };

    // 이미지 URL 처리 헬퍼 함수
    const getImageUrl = (url) => {
        // 상대 경로인 경우 API URL 추가
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}${url}` : url;
        }
        
        // 절대 경로인 경우, localhost나 127.0.0.1이 포함되어 있으면 REACT_APP_API_URL로 교체
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            if (process.env.REACT_APP_API_URL) {
                // URL에서 경로 부분만 추출하여 REACT_APP_API_URL과 결합
                const urlObj = new URL(url);
                return `${process.env.REACT_APP_API_URL}${urlObj.pathname}${urlObj.search}`;
            }
        }
        
        return url;
    };

    // 내용에서 이미지 태그와 동영상 태그를 실제 미디어로 렌더링
    const renderContent = (content) => {
        if (!content) return '';

        console.log("원본 내용:", content);

        // HTML 이미지 태그는 그대로 유지하고, 마크다운 형식도 지원
        let renderedContent = content;

        // ![이미지](URL) 패턴을 찾아서 실제 이미지로 변환 (기존 마크다운 지원)
        renderedContent = renderedContent.replace(/!\[이미지\]\((.*?)\)/g, (match, url) => {
            console.log("마크다운 이미지 URL 발견:", url);
            const imageUrl = getImageUrl(url);
            return `<img src="${imageUrl}" alt="이미지" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />`;
        });

        // [동영상](URL) 패턴을 찾아서 실제 동영상으로 변환
        renderedContent = renderedContent.replace(/\[동영상\]\((.*?)\)/g, (match, url) => {
            console.log("마크다운 동영상 URL 발견:", url);
            const videoUrl = getImageUrl(url); // getImageUrl과 동일한 로직 사용
            return `<video controls style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;"><source src="${videoUrl}" type="video/mp4">브라우저가 동영상 태그를 지원하지 않습니다.</video>`;
        });

        console.log("렌더링된 내용:", renderedContent);
        return renderedContent;
    };

    if (loading) {
        return (
            <div>
                <Header />
                <div className="p-4 max-w-4xl mx-auto">
                    <div className="bg-white p-8 rounded-2xl shadow space-y-4">
                        <div className="flex justify-center">
                            <p className="text-gray-500">게시글을 불러오는 중...</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header />
                <div className="p-4 max-w-4xl mx-auto">
                    <div className="bg-white p-8 rounded-2xl shadow space-y-4">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                            {error}
                        </div>
                        <button
                            onClick={() => navigate("/PostList_page")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!post) return null;

    return (
        <div>
            <Header />
            <div className="p-4 max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow space-y-8">
                    {/* 상단: 제목 + 상태 뱃지 + 우측 버튼 */}
                    <div className="flex items-start justify-between border-b pb-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => navigate("/PostList_page")}
                                className="px-3 py-1 text-gray-600 hover:text-gray-800 border rounded"
                            >
                                목록
                            </button>
                            <button
                                onClick={() => navigate(`/posts/${id}/edit`)}
                                className="px-3 py-1 text-blue-600 hover:text-blue-800 border rounded"
                            >
                                수정
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1 text-red-600 hover:text-red-800 border rounded"
                            >
                                삭제
                            </button>
                        </div>
                    </div>

                    {/* 글 정보 */}
                    <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-6 gap-y-2">
                        <div className="flex items-center gap-1">
                            <span className="font-medium">작성자</span>
                            <span className="text-gray-700">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-medium">작성일</span>
                            <span className="text-gray-700">{formatDate(post.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-medium">조회</span>
                            <span className="text-gray-700">{post.view_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-medium">추천</span>
                            <span className="text-gray-700">{post.like_count}</span>
                        </div>
                    </div>

                    {/* 본문 */}
                    <div className="text-gray-800 min-h-[120px] text-base leading-relaxed px-2">
                        <div dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />
                    </div>

                    {/* 추천/비추천 버튼 */}
                    <div className="flex justify-center gap-8 border-t pt-6">
                        <button
                            onClick={() => handleReaction('like')}
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg text-lg font-bold border transition-colors ${userReaction === 'like'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-gray-50 text-blue-700 border-blue-200 hover:bg-blue-50'}`}
                        >
                            <span role="img" aria-label="추천">👍</span> <span>{post.like_count}</span>
                        </button>
                        <button
                            onClick={() => handleReaction('dislike')}
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg text-lg font-bold border transition-colors ${userReaction === 'dislike'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-gray-50 text-red-700 border-red-200 hover:bg-red-50'}`}
                        >
                            <span role="img" aria-label="비추천">👎</span> <span>{post.dislike_count}</span>
                        </button>
                    </div>

                    {/* 댓글 섹션 */}
                    <div className="border-t pt-8">
                        <h3 className="text-lg font-semibold mb-4">댓글 <span className="text-blue-600">({comments.length})</span></h3>
                        {/* 댓글 작성 폼 */}
                        <form onSubmit={handleCommentSubmit} className="mb-6 flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={commentAuthor}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                                    placeholder="로그인된 사용자명이 자동으로 입력됩니다"
                                    readOnly
                                />
                            </div>
                            <div className="flex gap-2">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="댓글을 입력하세요..."
                                    rows="3"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    댓글 작성
                                </button>
                            </div>
                        </form>
                        {/* 댓글 목록 */}
                        <div className="space-y-4">
                            {comments.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">첫 번째 댓글을 작성해보세요!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="border-b pb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium">{comment.author}</div>
                                            <div className="text-sm text-gray-500">
                                                {formatDate(comment.created_at)}
                                            </div>
                                        </div>
                                        <div className="text-gray-700 whitespace-pre-wrap">
                                            {comment.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PostDetail; 