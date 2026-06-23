import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Header from "../../layout/Header";
import Footer from "../../layout/Footer";

const WritePost = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [author, setAuthor] = useState("");
    const [authorId, setAuthorId] = useState(null);
    const [isNotice, setIsNotice] = useState(false);
    const [isImportant, setIsImportant] = useState(false);
    const [isTop, setIsTop] = useState(false);
    const [category, setCategory] = useState("general");
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            setError("로그인이 필요합니다.");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setAuthor(decoded.full_name || "");
            setAuthorId(decoded.user_id || null);
        } catch (decodeError) {
            console.error("Token decode error:", decodeError);
            setError("사용자 정보를 불러오지 못했습니다.");
        }
    }, []);

    useEffect(() => {
        if (!isEditMode) return;

        const fetchPost = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${id}`, {
                    headers: {
                        "x-skip-view-count": "true",
                    },
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "게시글을 불러오지 못했습니다.");
                }

                setTitle(data.title || "");
                setContent(data.content || "");
                setCategory(data.category || "general");
                setIsNotice(Boolean(data.is_notice));
                setIsImportant(Boolean(data.is_important));
                setIsTop(Boolean(data.is_top));
            } catch (err) {
                setError(err.message || "게시글을 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, isEditMode]);

    const getMediaUrl = (url) => {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}${url}` : url;
        }

        if ((url.includes("localhost") || url.includes("127.0.0.1")) && process.env.REACT_APP_API_URL) {
            const urlObj = new URL(url);
            return `${process.env.REACT_APP_API_URL}${urlObj.pathname}${urlObj.search}`;
        }

        return url;
    };

    const renderContent = (currentContent) => {
        if (!currentContent) return "";

        let rendered = currentContent;

        rendered = rendered.replace(/!\[.*?\]\((.*?)\)/g, (_, url) => {
            const imageUrl = getMediaUrl(url);
            return `<img src="${imageUrl}" alt="image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />`;
        });

        rendered = rendered.replace(/\[동영상\]\((.*?)\)/g, (_, url) => {
            const videoUrl = getMediaUrl(url);
            return `<video controls style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;"><source src="${videoUrl}" type="video/mp4">브라우저가 동영상을 지원하지 않습니다.</video>`;
        });

        return rendered;
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        setError("");

        try {
            const uploadedImages = [];

            for (const file of files) {
                if (file.size > 20 * 1024 * 1024) {
                    setError("이미지 파일은 각각 최대 20MB까지 업로드 가능합니다.");
                    continue;
                }

                const formData = new FormData();
                formData.append("image", file);

                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/image`, {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("Image upload failed:", errorData);
                    setError("이미지 업로드에 실패했습니다.");
                    continue;
                }

                const data = await res.json();
                uploadedImages.push({
                    id: data.id,
                    url: data.url,
                    filename: file.name,
                });
            }

            setImages((prev) => [...prev, ...uploadedImages]);
        } catch (err) {
            console.error("Image upload failed:", err);
            setError("이미지 업로드 중 오류가 발생했습니다.");
        } finally {
            setUploading(false);
        }
    };

    const handleVideoUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingVideo(true);
        setError("");

        try {
            const uploadedVideos = [];

            for (const file of files) {
                if (file.size > 200 * 1024 * 1024) {
                    setError("동영상 파일은 각각 최대 200MB까지 업로드 가능합니다.");
                    continue;
                }

                const formData = new FormData();
                formData.append("video", file);

                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/video`, {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("Video upload failed:", errorData);
                    setError("동영상 업로드에 실패했습니다.");
                    continue;
                }

                const data = await res.json();
                uploadedVideos.push({
                    id: data.id,
                    url: data.url,
                    filename: file.name,
                });
            }

            setVideos((prev) => [...prev, ...uploadedVideos]);
        } catch (err) {
            console.error("Video upload failed:", err);
            setError("동영상 업로드 중 오류가 발생했습니다.");
        } finally {
            setUploadingVideo(false);
        }
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeVideo = (index) => {
        setVideos((prev) => prev.filter((_, i) => i !== index));
    };

    const insertImageToContent = (imageUrl) => {
        setContent((prev) => `${prev}\n![이미지](${imageUrl})\n`);
    };

    const insertVideoToContent = (videoUrl) => {
        setContent((prev) => `${prev}\n[동영상](${videoUrl})\n`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim() || !author.trim()) {
            setError("제목, 내용, 작성자를 모두 입력해 주세요.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const authToken = localStorage.getItem("authToken");
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/posts${isEditMode ? `/${id}` : ""}`,
                {
                    method: isEditMode ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                    },
                    body: JSON.stringify({
                        title: title.trim(),
                        content: content.trim(),
                        author: author.trim(),
                        author_id: authorId,
                        category,
                        images: images.map((img) => img.id),
                        videos: videos.map((vid) => vid.id),
                        is_notice: isNotice,
                        is_important: isImportant,
                        is_top: isTop,
                    }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                alert(isEditMode ? "게시글이 수정되었습니다." : "게시글이 작성되었습니다.");
                navigate(isEditMode ? `/posts/${id}` : "/PostList_page");
            } else {
                setError(data.error || `게시글 ${isEditMode ? "수정" : "작성"}에 실패했습니다.`);
            }
        } catch (err) {
            console.error("Post submit failed:", err);
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
                    <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isEditMode ? "게시글 수정" : "글쓰기"}
                        </h2>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
                                    <span className="text-sm">가이드</span>
                                </label>
                            </div>
                        </div>

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

                        <div className="bg-gray-50 p-3 border border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">작성자: {author}</span>
                            </div>
                        </div>

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
                                    placeholder="내용을 입력해 주세요."
                                    required
                                />
                            )}
                        </div>

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
                                        className={`px-4 py-2 border border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-50 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        {uploading ? "업로드 중..." : "이미지 선택"}
                                    </label>
                                    <span className="text-sm text-gray-500">
                                        이미지 파일은 각각 최대 20MB까지 업로드 가능합니다.
                                    </span>
                                </div>
                            </div>

                            {images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative border border-gray-200 rounded">
                                            <img
                                                src={getMediaUrl(image.url)}
                                                alt={image.filename}
                                                className="w-full h-24 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                x
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

                        <div className="border-t border-gray-200 pt-4">
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    동영상 첨부
                                </label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="file"
                                        multiple
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                        className="hidden"
                                        id="video-upload"
                                        disabled={uploadingVideo}
                                    />
                                    <label
                                        htmlFor="video-upload"
                                        className={`px-4 py-2 border border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-50 ${uploadingVideo ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        {uploadingVideo ? "업로드 중..." : "동영상 선택"}
                                    </label>
                                    <span className="text-sm text-gray-500">
                                        동영상 파일은 각각 최대 200MB까지 업로드 가능합니다.
                                    </span>
                                </div>
                            </div>

                            {videos.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {videos.map((video, index) => (
                                        <div key={index} className="relative border border-gray-200 rounded">
                                            <video
                                                src={getMediaUrl(video.url)}
                                                className="w-full h-32 object-cover rounded"
                                                controls={false}
                                                preload="metadata"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeVideo(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                x
                                            </button>
                                            <div className="p-2">
                                                <p className="text-xs text-gray-600 truncate">{video.filename}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => insertVideoToContent(video.url)}
                                                    className="mt-1 w-full px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                >
                                                    내용에 삽입
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

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

                        <div className="bg-yellow-50 border border-yellow-200 p-3 text-sm text-gray-600">
                            비방, 혐오, 저작권 침해 게시물은 정책에 따라 제한될 수 있습니다.
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                <span className="text-red-500">*</span> 필수 입력 항목
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(isEditMode ? `/posts/${id}` : "/PostList_page")}
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
                                    {loading ? (isEditMode ? "수정 중..." : "작성 중...") : (isEditMode ? "수정" : "등록")}
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
