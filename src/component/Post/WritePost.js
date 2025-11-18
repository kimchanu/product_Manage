import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Header from "../../layout/Header";
import Footer from "../../layout/Footer";

const WritePost = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [author, setAuthor] = useState("");
    const [isNotice, setIsNotice] = useState(false);
    const [isImportant, setIsImportant] = useState(false);
    const [isTop, setIsTop] = useState(false);
    const [category, setCategory] = useState("general");
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const navigate = useNavigate();

    // 사용자 정보 가져오기
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setAuthor(decoded.full_name);
            } catch (error) {
                console.error("토큰 디코딩 오류:", error);
                setError("사용자 정보를 가져올 수 없습니다.");
            }
        } else {
            setError("로그인이 필요합니다.");
        }
    }, []);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        setError("");

        try {
            const uploadedImages = [];

            for (const file of files) {
                if (file.size > 20 * 1024 * 1024) { // 20MB 제한
                    setError("이미지 파일은 각각 최대 20MB 업로드 가능합니다.");
                    continue;
                }

                const formData = new FormData();
                formData.append('image', file);

                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/image`, {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("이미지 업로드 응답:", data);
                    uploadedImages.push({
                        id: data.id,
                        url: data.url,
                        filename: file.name
                    });
                } else {
                    const errorData = await res.json();
                    console.error("이미지 업로드 실패:", errorData);
                    setError("이미지 업로드에 실패했습니다.");
                }
            }

            setImages(prev => [...prev, ...uploadedImages]);
        } catch (err) {
            console.error("이미지 업로드 실패:", err);
            setError("이미지 업로드 중 오류가 발생했습니다.");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
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

    const insertImageToContent = (imageUrl) => {
        const imageTag = `\n![이미지](${imageUrl})\n`;
        console.log("이미지 태그 삽입:", imageTag);
        setContent(prev => prev + imageTag);
    };

    // 내용에서 이미지 태그를 실제 이미지로 렌더링
    const renderContent = (content) => {
        if (!content) return '';

        // ![이미지](URL) 패턴을 찾아서 실제 이미지로 변환
        return content.replace(/!\[이미지\]\((.*?)\)/g, (match, url) => {
            const imageUrl = getImageUrl(url);
            return `<img src="${imageUrl}" alt="이미지" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />`;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim() || !author.trim()) {
            setError("제목, 내용, 작성자를 모두 입력해주세요.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    author: author.trim(),
                    category: category,
                    images: images.map(img => img.id),
                    is_notice: isNotice,
                    is_important: isImportant,
                    is_top: isTop
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("게시글이 성공적으로 작성되었습니다!");
                navigate("/PostList_page");
            } else {
                setError(data.error || "게시글 작성에 실패했습니다.");
            }
        } catch (err) {
            console.error("글 작성 실패:", err);
            setError("네트워크 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <div className="max-w-4xl mx-auto p-4">
                <div className="bg-white border border-gray-300">
                    {/* 상단 헤더 */}
                    <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                        <h2 className="text-lg font-semibold text-gray-800">글쓰기</h2>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {/* 말머리 선택 */}
                        <div className="border-b border-gray-200 pb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                말머리
                            </label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="category"
                                        value="general"
                                        checked={category === "general"}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">일반</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="category"
                                        value="question"
                                        checked={category === "question"}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">질문</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="category"
                                        value="info"
                                        checked={category === "info"}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">정보</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="category"
                                        value="guide"
                                        checked={category === "guide"}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">가이드/팁</span>
                                </label>
                            </div>
                        </div>

                        {/* 제목 입력 */}
                        <div>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none"
                                placeholder="제목을 입력해 주세요."
                                required
                            />
                        </div>

                        {/* 작성자 정보 */}
                        <div className="bg-gray-50 p-3 border border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">작성자: {author}</span>
                            </div>
                        </div>

                        {/* 본문 입력 */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    내용 <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    {showPreview ? "편집" : "미리보기"}
                                </button>
                            </div>

                            {showPreview ? (
                                <div className="w-full px-3 py-2 border border-gray-300 bg-white min-h-[400px] text-base leading-relaxed">
                                    <div dangerouslySetInnerHTML={{ __html: renderContent(content) }} />
                                </div>
                            ) : (
                                <textarea
                                    id="content"
                                    rows={20}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
                                    placeholder="내용을 입력하세요"
                                    required
                                />
                            )}
                        </div>

                        {/* 이미지 업로드 */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    이미지 첨부
                                </label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className={`px-4 py-2 border border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-50 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {uploading ? "업로드 중..." : "이미지 선택"}
                                    </label>
                                    <span className="text-sm text-gray-500">
                                        이미지 파일은 각각 최대 20MB 업로드 가능합니다.
                                    </span>
                                </div>
                            </div>

                            {/* 업로드된 이미지 목록 */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative border border-gray-200 rounded">
                                            <img
                                                src={getImageUrl(image.url)}
                                                alt={image.filename}
                                                className="w-full h-24 object-cover rounded"
                                                onError={(e) => {
                                                    console.error("이미지 로드 실패:", image.url);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                            <div className="p-2">
                                                <p className="text-xs text-gray-600 truncate">{image.filename}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => insertImageToContent(image.url)}
                                                    className="mt-1 w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                                >
                                                    내용에 삽입
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 공지사항 옵션 */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isNotice"
                                        checked={isNotice}
                                        onChange={(e) => setIsNotice(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">공지사항으로 등록</span>
                                </label>

                                {isNotice && (
                                    <>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="isImportant"
                                                checked={isImportant}
                                                onChange={(e) => setIsImportant(e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">중요 공지사항</span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="isTop"
                                                checked={isTop}
                                                onChange={(e) => setIsTop(e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">상단 고정</span>
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 하단 안내문 */}
                        <div className="bg-yellow-50 border border-yellow-200 p-3 text-sm text-gray-600">
                            음란물, 차별, 비하, 혐오 및 초상권, 저작권 침해 게시물은 민, 형사상의 책임을 질 수 있습니다.
                        </div>

                        {/* 버튼 영역 */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                <span className="text-red-500">*</span> 필수 입력 항목
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => navigate("/PostList_page")}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? "작성 중..." : "등록"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default WritePost;