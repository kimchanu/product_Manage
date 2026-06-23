import React, { useEffect, useState } from "react";

const tabs = [
  { key: "overview", label: "통계" },
  { key: "users", label: "회원 관리" },
  { key: "approvals", label: "전자결재" },
  { key: "posts", label: "게시판 관리" },
  { key: "notices", label: "공지사항" },
  { key: "popups", label: "팝업 관리" },
];

const emptyNoticeForm = {
  title: "",
  content: "",
  category: "general",
  is_important: false,
  is_top: false,
};

const emptyPopupForm = {
  title: "",
  content: "",
  link_url: "",
  start_date: "",
  end_date: "",
  is_active: true,
  priority: 0,
};

const categoryLabel = {
  general: "일반",
  question: "질문",
  info: "정보",
  guide: "가이드",
  trade: "중고거래",
};

function AdminConsole() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [overview, setOverview] = useState({ summary: {}, recentUsers: [], recentPosts: [] });
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [popups, setPopups] = useState([]);
  const [approvalSettings, setApprovalSettings] = useState([]);
  const [approvalCandidates, setApprovalCandidates] = useState([]);

  const [userSearch, setUserSearch] = useState("");
  const [postSearch, setPostSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [selectedPopup, setSelectedPopup] = useState(null);
  const [noticeForm, setNoticeForm] = useState(emptyNoticeForm);
  const [popupForm, setPopupForm] = useState(emptyPopupForm);
  const [approvalBusinessLocation, setApprovalBusinessLocation] = useState("GK");
  const [approvalForms, setApprovalForms] = useState({});

  const approvalDepartments = ["ITS", "시설", "기전"];

  const apiFetch = async (path, options = {}) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "관리자 요청 처리 중 오류가 발생했습니다.");
    }
    return data;
  };

  const loadOverview = async () => {
    const data = await apiFetch("/api/admin/overview");
    setOverview(data);
  };

  const loadUsers = async (search = "") => {
    const data = await apiFetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
    setUsers(data.users || []);
  };

  const loadPosts = async (search = "") => {
    const data = await apiFetch(`/api/admin/posts?limit=100&search=${encodeURIComponent(search)}`);
    setPosts(data.posts || []);
  };

  const loadNotices = async () => {
    const data = await apiFetch("/api/admin/notices");
    setNotices(data.notices || []);
  };

  const loadPopups = async () => {
    const data = await apiFetch("/api/admin/popups");
    setPopups(data.popups || []);
  };

  const loadApprovalSettings = async (businessLocation = approvalBusinessLocation) => {
    const data = await apiFetch(
      `/api/statement/approval/settings?businessLocation=${encodeURIComponent(businessLocation)}`
    );
    const settings = data.settings || [];
    setApprovalSettings(settings);
    setApprovalForms((prev) => {
      const next = { ...prev };
      const firstMatchedSetting = settings.find((item) =>
        approvalDepartments.includes(item.department)
      );
      next[businessLocation] = String(firstMatchedSetting?.approver_user_id || "");
      return next;
    });
  };

  const loadApprovalCandidates = async (businessLocation = approvalBusinessLocation) => {
    const data = await apiFetch(
      `/api/statement/approval/approver-candidates?businessLocation=${encodeURIComponent(businessLocation)}`
    );
    setApprovalCandidates(data.approverCandidates || []);
  };

  // Initial admin data load should run once on page entry.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([
          loadOverview(),
          loadUsers(""),
          loadApprovalSettings("GK"),
          loadApprovalCandidates("GK"),
          loadPosts(""),
          loadNotices(),
          loadPopups(),
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const flashMessage = (nextMessage) => {
    setMessage(nextMessage);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleApprovalLocationChange = async (nextLocation) => {
    setApprovalBusinessLocation(nextLocation);
    try {
      setLoading(true);
      setError("");
      await Promise.all([
        loadApprovalSettings(nextLocation),
        loadApprovalCandidates(nextLocation),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalSave = async () => {
    const approverUserId = Number(approvalForms[approvalBusinessLocation] || 0);

    if (!approverUserId) {
      setError("승인자를 선택해 주세요.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await Promise.all(
        approvalDepartments.map((department) =>
          apiFetch("/api/statement/approval/approver", {
            method: "PUT",
            body: JSON.stringify({
              businessLocation: approvalBusinessLocation,
              department,
              approverUserId,
            }),
          })
        )
      );
      await loadApprovalSettings(approvalBusinessLocation);
      flashMessage("ITS, 시설, 기전 승인자를 한 번에 저장했습니다.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUserSave = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      await apiFetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify(selectedUser),
      });
      await Promise.all([loadUsers(userSearch), loadOverview()]);
      flashMessage("회원 정보를 저장했습니다.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePostSave = async () => {
    if (!selectedPost) return;

    try {
      setSaving(true);
      await apiFetch(`/api/admin/posts/${selectedPost.id}`, {
        method: "PUT",
        body: JSON.stringify(selectedPost),
      });
      await Promise.all([loadPosts(postSearch), loadNotices(), loadOverview()]);
      flashMessage("게시글을 저장했습니다.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePostDelete = async (id) => {
    if (!window.confirm("이 게시글을 삭제하시겠습니까?")) return;

    try {
      setSaving(true);
      await apiFetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (selectedPost?.id === id) {
        setSelectedPost(null);
      }
      await Promise.all([loadPosts(postSearch), loadNotices(), loadOverview()]);
      flashMessage("게시글을 삭제했습니다.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNoticeSubmit = async () => {
    try {
      setSaving(true);
      const method = selectedNotice ? "PUT" : "POST";
      const path = selectedNotice ? `/api/admin/notices/${selectedNotice.id}` : "/api/admin/notices";

      await apiFetch(path, {
        method,
        body: JSON.stringify(noticeForm),
      });

      setSelectedNotice(null);
      setNoticeForm(emptyNoticeForm);
      await Promise.all([loadNotices(), loadPosts(postSearch), loadOverview()]);
      flashMessage(selectedNotice ? "공지사항을 수정했습니다." : "공지사항을 등록했습니다.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNoticeEdit = (notice) => {
    setSelectedNotice(notice);
    setNoticeForm({
      title: notice.title || "",
      content: notice.content || "",
      category: notice.category || "general",
      is_important: Boolean(notice.is_important),
      is_top: Boolean(notice.is_top),
    });
  };

  const handleNoticeDelete = async (id) => {
    if (!window.confirm("이 공지사항을 삭제하시겠습니까?")) return;

    try {
      setSaving(true);
      await apiFetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      if (selectedNotice?.id === id) {
        setSelectedNotice(null);
        setNoticeForm(emptyNoticeForm);
      }
      await Promise.all([loadNotices(), loadPosts(postSearch), loadOverview()]);
      flashMessage("공지사항을 삭제했습니다.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePopupSubmit = async () => {
    try {
      setSaving(true);
      const method = selectedPopup ? "PUT" : "POST";
      const path = selectedPopup ? `/api/admin/popups/${selectedPopup.id}` : "/api/admin/popups";

      await apiFetch(path, {
        method,
        body: JSON.stringify(popupForm),
      });

      setSelectedPopup(null);
      setPopupForm(emptyPopupForm);
      await Promise.all([loadPopups(), loadOverview()]);
      flashMessage(selectedPopup ? "팝업을 수정했습니다." : "팝업을 등록했습니다.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePopupEdit = (popup) => {
    setSelectedPopup(popup);
    setPopupForm({
      title: popup.title || "",
      content: popup.content || "",
      link_url: popup.link_url || "",
      start_date: popup.start_date ? toInputDateTime(popup.start_date) : "",
      end_date: popup.end_date ? toInputDateTime(popup.end_date) : "",
      is_active: Boolean(popup.is_active),
      priority: popup.priority || 0,
    });
  };

  const handlePopupDelete = async (id) => {
    if (!window.confirm("이 팝업을 삭제하시겠습니까?")) return;

    try {
      setSaving(true);
      await apiFetch(`/api/admin/popups/${id}`, { method: "DELETE" });
      if (selectedPopup?.id === id) {
        setSelectedPopup(null);
        setPopupForm(emptyPopupForm);
      }
      await Promise.all([loadPopups(), loadOverview()]);
      flashMessage("팝업을 삭제했습니다.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("ko-KR");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-900 to-teal-800 p-8 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Admin Console</p>
        <h1 className="mt-3 text-3xl font-bold">운영 관리자 페이지</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-100/90">
          회원, 게시판, 공지사항, 팝업을 한 곳에서 확인하고 바로 수정할 수 있습니다.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          관리자 데이터를 불러오는 중입니다.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "bg-slate-900 text-white shadow"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <OverviewTab overview={overview} formatDate={formatDate} />
          )}

          {activeTab === "users" && (
            <UsersTab
              users={users}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              loadUsers={loadUsers}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              handleUserSave={handleUserSave}
              saving={saving}
            />
          )}

          {activeTab === "approvals" && (
            <ApprovalsTab
              approvalBusinessLocation={approvalBusinessLocation}
              onBusinessLocationChange={handleApprovalLocationChange}
              approvalSettings={approvalSettings}
              approvalCandidates={approvalCandidates}
              approvalForms={approvalForms}
              setApprovalForms={setApprovalForms}
              handleApprovalSave={handleApprovalSave}
              saving={saving}
            />
          )}

          {activeTab === "posts" && (
            <PostsTab
              posts={posts}
              postSearch={postSearch}
              setPostSearch={setPostSearch}
              loadPosts={loadPosts}
              selectedPost={selectedPost}
              setSelectedPost={setSelectedPost}
              handlePostSave={handlePostSave}
              handlePostDelete={handlePostDelete}
              saving={saving}
              formatDate={formatDate}
            />
          )}

          {activeTab === "notices" && (
            <NoticesTab
              notices={notices}
              selectedNotice={selectedNotice}
              setSelectedNotice={setSelectedNotice}
              noticeForm={noticeForm}
              setNoticeForm={setNoticeForm}
              handleNoticeEdit={handleNoticeEdit}
              handleNoticeDelete={handleNoticeDelete}
              handleNoticeSubmit={handleNoticeSubmit}
              saving={saving}
              formatDate={formatDate}
            />
          )}

          {activeTab === "popups" && (
            <PopupsTab
              popups={popups}
              selectedPopup={selectedPopup}
              setSelectedPopup={setSelectedPopup}
              popupForm={popupForm}
              setPopupForm={setPopupForm}
              handlePopupEdit={handlePopupEdit}
              handlePopupDelete={handlePopupDelete}
              handlePopupSubmit={handlePopupSubmit}
              saving={saving}
              formatDate={formatDate}
            />
          )}
        </>
      )}
    </div>
  );
}

function OverviewTab({ overview, formatDate }) {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="전체 회원" value={overview.summary.totalUsers} />
        <SummaryCard label="관리자 회원" value={overview.summary.adminUsers} />
        <SummaryCard label="활성 게시글" value={overview.summary.activePosts} />
        <SummaryCard label="활성 팝업" value={overview.summary.activePopups} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">최근 회원</h2>
            <span className="text-sm text-slate-400">최대 5명</span>
          </div>
          <div className="mt-4 space-y-3">
            {overview.recentUsers?.map((user) => (
              <div key={user.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">{user.full_name}</p>
                    <p className="text-sm text-slate-500">
                      {user.username} · {user.business_location} · {user.department}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">
                    권한 {user.is_admin}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">최근 게시글</h2>
            <span className="text-sm text-slate-400">최대 5건</span>
          </div>
          <div className="mt-4 space-y-3">
            {overview.recentPosts?.map((post) => (
              <div key={post.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="font-medium text-slate-900">{post.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {post.author} · {categoryLabel[post.category] || post.category} · 조회 {post.view_count}
                </p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(post.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ApprovalsTab({
  approvalBusinessLocation,
  onBusinessLocationChange,
  approvalSettings,
  approvalCandidates,
  approvalForms,
  setApprovalForms,
  handleApprovalSave,
  saving,
}) {
  const departments = ["ITS", "시설", "기전"];
  const locationOptions = [
    { value: "GK", label: "GK사업소" },
    { value: "CM", label: "천마사업소" },
    { value: "ES", label: "을숙도사업소" },
    { value: "KN", label: "강남사업소" },
    { value: "SW", label: "수원사업소" },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">승인자 설정</h2>
          <select
            value={approvalBusinessLocation}
            onChange={(e) => onBusinessLocationChange(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {locationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          {(() => {
            const groupedSetting = approvalSettings.find((item) => departments.includes(item.department));
            return (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-3 py-3 text-left">적용 부서</th>
                <th className="px-3 py-3 text-left">현재 승인자</th>
                <th className="px-3 py-3 text-left">직급</th>
                <th className="px-3 py-3 text-left">수정일</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-3 py-3 font-medium text-slate-900">ITS / 시설 / 기전</td>
                <td className="px-3 py-3">{groupedSetting?.approver_name || "-"}</td>
                <td className="px-3 py-3">{groupedSetting?.approver_position || "-"}</td>
                <td className="px-3 py-3">
                  {groupedSetting?.updated_at
                    ? new Date(groupedSetting.updated_at).toLocaleString("ko-KR")
                    : "-"}
                </td>
              </tr>
            </tbody>
          </table>
            );
          })()}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">사업소별 공통 승인자 지정</h2>
        <div className="mt-4 rounded-2xl border border-slate-200 p-4">
          <div className="mb-2 text-sm font-semibold text-slate-800">적용 대상: ITS / 시설 / 기전</div>
          <div className="mb-3 text-sm text-slate-500">
            한 명을 지정하면 해당 사업소의 세 부서 승인자에 동일하게 반영됩니다.
          </div>
          <div className="flex gap-2">
            <select
              value={approvalForms[approvalBusinessLocation] || ""}
              onChange={(e) =>
                setApprovalForms((prev) => ({
                  ...prev,
                  [approvalBusinessLocation]: e.target.value,
                }))
              }
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">승인자 선택</option>
              {approvalCandidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.full_name} {candidate.position ? `(${candidate.position})` : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleApprovalSave()}
              disabled={saving || !approvalForms[approvalBusinessLocation]}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function UsersTab({
  users,
  userSearch,
  setUserSearch,
  loadUsers,
  selectedUser,
  setSelectedUser,
  handleUserSave,
  saving,
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">회원 리스트</h2>
          <div className="flex gap-2">
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="이름, 사번, 부서 검색"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => loadUsers(userSearch)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
            >
              검색
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-3 py-3 text-left">사번</th>
                <th className="px-3 py-3 text-left">이름</th>
                <th className="px-3 py-3 text-left">사업장</th>
                <th className="px-3 py-3 text-left">부서</th>
                <th className="px-3 py-3 text-left">권한</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUser({ ...user, password: "" })}
                  className={`cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${
                    selectedUser?.id === user.id ? "bg-cyan-50" : ""
                  }`}
                >
                  <td className="px-3 py-3">{user.username}</td>
                  <td className="px-3 py-3">{user.full_name}</td>
                  <td className="px-3 py-3">{user.business_location}</td>
                  <td className="px-3 py-3">{user.department}</td>
                  <td className="px-3 py-3">{user.is_admin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">회원 정보 수정</h2>
        {selectedUser ? (
          <div className="mt-4 space-y-3">
            <Field label="사번" value={selectedUser.username} disabled />
            <Field label="이름" value={selectedUser.full_name || ""} onChange={(value) => setSelectedUser((prev) => ({ ...prev, full_name: value }))} />
            <Field label="직급" value={selectedUser.position || ""} onChange={(value) => setSelectedUser((prev) => ({ ...prev, position: value }))} />
            <Field label="이메일" value={selectedUser.email || ""} onChange={(value) => setSelectedUser((prev) => ({ ...prev, email: value }))} />
            <Field label="사업장" value={selectedUser.business_location || ""} onChange={(value) => setSelectedUser((prev) => ({ ...prev, business_location: value }))} />
            <Field label="부서" value={selectedUser.department || ""} onChange={(value) => setSelectedUser((prev) => ({ ...prev, department: value }))} />
            <Field label="새 비밀번호" type="password" value={selectedUser.password || ""} onChange={(value) => setSelectedUser((prev) => ({ ...prev, password: value }))} />
            <Field label="권한 숫자" type="number" value={selectedUser.is_admin} onChange={(value) => setSelectedUser((prev) => ({ ...prev, is_admin: Number(value || 0) }))} />
            <button type="button" onClick={handleUserSave} disabled={saving} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
              저장
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">왼쪽에서 회원을 선택해 주세요.</p>
        )}
      </div>
    </section>
  );
}

function PostsTab({
  posts,
  postSearch,
  setPostSearch,
  loadPosts,
  selectedPost,
  setSelectedPost,
  handlePostSave,
  handlePostDelete,
  saving,
  formatDate,
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">게시판 정보</h2>
          <div className="flex gap-2">
            <input
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              placeholder="제목, 작성자 검색"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => loadPosts(postSearch)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
            >
              검색
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-3 py-3 text-left">제목</th>
                <th className="px-3 py-3 text-left">작성자</th>
                <th className="px-3 py-3 text-left">분류</th>
                <th className="px-3 py-3 text-left">등록일</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  onClick={() => setSelectedPost({ ...post })}
                  className={`cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${
                    selectedPost?.id === post.id ? "bg-cyan-50" : ""
                  }`}
                >
                  <td className="px-3 py-3">
                    <div className="font-medium text-slate-900">{post.title}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      조회 {post.view_count} · 추천 {post.like_count}
                    </div>
                  </td>
                  <td className="px-3 py-3">{post.author}</td>
                  <td className="px-3 py-3">{categoryLabel[post.category] || post.category}</td>
                  <td className="px-3 py-3">{formatDate(post.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">게시글 수정</h2>
        {selectedPost ? (
          <div className="mt-4 space-y-3">
            <Field label="제목" value={selectedPost.title || ""} onChange={(value) => setSelectedPost((prev) => ({ ...prev, title: value }))} />
            <SelectField
              label="분류"
              value={selectedPost.category || "general"}
              onChange={(value) => setSelectedPost((prev) => ({ ...prev, category: value }))}
              options={[
                { value: "general", label: "일반" },
                { value: "question", label: "질문" },
                { value: "info", label: "정보" },
                { value: "guide", label: "가이드" },
                { value: "trade", label: "중고거래" },
              ]}
            />
            <TextAreaField label="내용" value={selectedPost.content || ""} onChange={(value) => setSelectedPost((prev) => ({ ...prev, content: value }))} rows={10} />
            <CheckField label="공지" checked={Boolean(selectedPost.is_notice)} onChange={(checked) => setSelectedPost((prev) => ({ ...prev, is_notice: checked }))} />
            <CheckField label="중요" checked={Boolean(selectedPost.is_important)} onChange={(checked) => setSelectedPost((prev) => ({ ...prev, is_important: checked }))} />
            <CheckField label="상단 고정" checked={Boolean(selectedPost.is_top)} onChange={(checked) => setSelectedPost((prev) => ({ ...prev, is_top: checked }))} />
            <div className="flex gap-2">
              <button type="button" onClick={handlePostSave} disabled={saving} className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
                저장
              </button>
              <button type="button" onClick={() => handlePostDelete(selectedPost.id)} disabled={saving} className="rounded-xl border border-red-300 px-4 py-3 text-sm font-medium text-red-600">
                삭제
              </button>
            </div>
            <a href={`/posts/${selectedPost.id}`} className="block text-center text-sm text-cyan-700 underline">
              상세 페이지 보기
            </a>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">왼쪽에서 게시글을 선택해 주세요.</p>
        )}
      </div>
    </section>
  );
}

function NoticesTab({
  notices,
  selectedNotice,
  setSelectedNotice,
  noticeForm,
  setNoticeForm,
  handleNoticeEdit,
  handleNoticeDelete,
  handleNoticeSubmit,
  saving,
  formatDate,
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">공지사항 목록</h2>
          <button
            type="button"
            onClick={() => {
              setSelectedNotice(null);
              setNoticeForm(emptyNoticeForm);
            }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            새 공지
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {notices.map((notice) => (
            <div key={notice.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{notice.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {notice.author} · {formatDate(notice.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleNoticeEdit(notice)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs">
                    수정
                  </button>
                  <button type="button" onClick={() => handleNoticeDelete(notice.id)} className="rounded-xl border border-red-300 px-3 py-2 text-xs text-red-600">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{selectedNotice ? "공지사항 수정" : "공지사항 등록"}</h2>
        <div className="mt-4 space-y-3">
          <Field label="제목" value={noticeForm.title} onChange={(value) => setNoticeForm((prev) => ({ ...prev, title: value }))} />
          <SelectField
            label="분류"
            value={noticeForm.category}
            onChange={(value) => setNoticeForm((prev) => ({ ...prev, category: value }))}
            options={[
              { value: "general", label: "일반" },
              { value: "info", label: "정보" },
              { value: "guide", label: "가이드" },
            ]}
          />
          <TextAreaField label="내용" value={noticeForm.content} onChange={(value) => setNoticeForm((prev) => ({ ...prev, content: value }))} rows={10} />
          <CheckField label="중요 공지" checked={noticeForm.is_important} onChange={(checked) => setNoticeForm((prev) => ({ ...prev, is_important: checked }))} />
          <CheckField label="상단 고정" checked={noticeForm.is_top} onChange={(checked) => setNoticeForm((prev) => ({ ...prev, is_top: checked }))} />
          <button type="button" onClick={handleNoticeSubmit} disabled={saving} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
            {selectedNotice ? "공지사항 수정" : "공지사항 등록"}
          </button>
        </div>
      </div>
    </section>
  );
}

function PopupsTab({
  popups,
  selectedPopup,
  setSelectedPopup,
  popupForm,
  setPopupForm,
  handlePopupEdit,
  handlePopupDelete,
  handlePopupSubmit,
  saving,
  formatDate,
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">팝업 목록</h2>
          <button
            type="button"
            onClick={() => {
              setSelectedPopup(null);
              setPopupForm(emptyPopupForm);
            }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            새 팝업
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {popups.map((popup) => (
            <div key={popup.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{popup.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    우선순위 {popup.priority} · {popup.is_active ? "활성" : "비활성"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(popup.start_date)} ~ {formatDate(popup.end_date)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handlePopupEdit(popup)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs">
                    수정
                  </button>
                  <button type="button" onClick={() => handlePopupDelete(popup.id)} className="rounded-xl border border-red-300 px-3 py-2 text-xs text-red-600">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{selectedPopup ? "팝업 수정" : "팝업 등록"}</h2>
        <div className="mt-4 space-y-3">
          <Field label="제목" value={popupForm.title} onChange={(value) => setPopupForm((prev) => ({ ...prev, title: value }))} />
          <Field label="링크 URL" value={popupForm.link_url} onChange={(value) => setPopupForm((prev) => ({ ...prev, link_url: value }))} />
          <TextAreaField label="내용" value={popupForm.content} onChange={(value) => setPopupForm((prev) => ({ ...prev, content: value }))} rows={8} />
          <Field label="시작 일시" type="datetime-local" value={popupForm.start_date} onChange={(value) => setPopupForm((prev) => ({ ...prev, start_date: value }))} />
          <Field label="종료 일시" type="datetime-local" value={popupForm.end_date} onChange={(value) => setPopupForm((prev) => ({ ...prev, end_date: value }))} />
          <Field label="우선순위" type="number" value={popupForm.priority} onChange={(value) => setPopupForm((prev) => ({ ...prev, priority: Number(value || 0) }))} />
          <CheckField label="활성 상태" checked={popupForm.is_active} onChange={(checked) => setPopupForm((prev) => ({ ...prev, is_active: checked }))} />
          <button type="button" onClick={handlePopupSubmit} disabled={saving} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
            {selectedPopup ? "팝업 수정" : "팝업 등록"}
          </button>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{Number(value || 0).toLocaleString()}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, value, onChange, rows = 6 }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
    </label>
  );
}

function CheckField({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function toInputDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default AdminConsole;
