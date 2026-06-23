const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const requireAdmin = (req, res, next) => {
  const adminLevel = Number(req.user?.admin || 0);
  if (adminLevel < 1) {
    return res.status(403).json({ error: "관리자 권한이 필요합니다." });
  }
  next();
};

const popupTableSql = `
  CREATE TABLE IF NOT EXISTS admin_popup (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    link_url VARCHAR(500) NULL,
    start_date DATETIME NULL,
    end_date DATETIME NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    priority INT NOT NULL DEFAULT 0,
    created_by VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const ensurePopupTable = async () => {
  await db.query(popupTableSql);
};

const normalizeDateTime = (value) => {
  if (!value) return null;
  return String(value).replace("T", " ");
};

const getUsersOrderColumn = async () => {
  const [rows] = await db.query(
    `
      SELECT COLUMN_NAME
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'users'
        AND column_name IN ('created_at', 'updated_at', 'id')
    `
  );

  if (rows.some((row) => row.COLUMN_NAME === "created_at")) {
    return "created_at";
  }

  if (rows.some((row) => row.COLUMN_NAME === "updated_at")) {
    return "updated_at";
  }

  return "id";
};

router.use(authMiddleware, requireAdmin);

router.get("/overview", async (req, res) => {
  try {
    await ensurePopupTable();

    const [userStatsRows] = await db.query(`
      SELECT
        COUNT(*) AS totalUsers,
        SUM(CASE WHEN COALESCE(is_admin, 0) >= 1 THEN 1 ELSE 0 END) AS adminUsers
      FROM users
    `);

    const [postStatsRows] = await db.query(`
      SELECT
        COUNT(*) AS totalPosts,
        SUM(CASE WHEN is_deleted = 0 THEN 1 ELSE 0 END) AS activePosts,
        SUM(CASE WHEN is_deleted = 0 AND is_notice = 1 THEN 1 ELSE 0 END) AS noticePosts
      FROM post
    `);

    const [popupStatsRows] = await db.query(`
      SELECT
        COUNT(*) AS totalPopups,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS activePopups
      FROM admin_popup
    `);

    const userOrderColumn = await getUsersOrderColumn();

    const [recentUsers] = await db.query(`
      SELECT
        id,
        username,
        full_name,
        position,
        email,
        business_location,
        department,
        COALESCE(is_admin, 0) AS is_admin
      FROM users
      ORDER BY ${userOrderColumn} DESC
      LIMIT 5
    `);

    const [recentPosts] = await db.query(`
      SELECT
        id,
        title,
        author,
        category,
        is_notice,
        is_important,
        is_top,
        created_at,
        view_count
      FROM post
      WHERE is_deleted = 0
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      summary: {
        totalUsers: Number(userStatsRows[0]?.totalUsers || 0),
        adminUsers: Number(userStatsRows[0]?.adminUsers || 0),
        totalPosts: Number(postStatsRows[0]?.totalPosts || 0),
        activePosts: Number(postStatsRows[0]?.activePosts || 0),
        noticePosts: Number(postStatsRows[0]?.noticePosts || 0),
        totalPopups: Number(popupStatsRows[0]?.totalPopups || 0),
        activePopups: Number(popupStatsRows[0]?.activePopups || 0),
      },
      recentUsers,
      recentPosts,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ error: "관리자 통계를 불러오지 못했습니다." });
  }
});

router.get("/users", async (req, res) => {
  try {
    const { search = "" } = req.query;
    const keyword = `%${String(search).trim()}%`;
    const userOrderColumn = await getUsersOrderColumn();

    const [rows] = await db.query(
      `
        SELECT
          id,
          username,
          full_name,
          position,
          email,
          business_location,
          department,
          COALESCE(is_admin, 0) AS is_admin
        FROM users
        WHERE
          ? = '%%'
          OR username LIKE ?
          OR full_name LIKE ?
          OR email LIKE ?
          OR department LIKE ?
          OR business_location LIKE ?
        ORDER BY ${userOrderColumn} DESC
      `,
      [keyword, keyword, keyword, keyword, keyword, keyword]
    );

    res.json({ users: rows });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ error: "회원 목록을 불러오지 못했습니다." });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      position,
      email,
      business_location,
      department,
      is_admin,
      password,
    } = req.body;

    const [users] = await db.query("SELECT id FROM users WHERE id = ? LIMIT 1", [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: "회원을 찾을 수 없습니다." });
    }

    if (password && String(password).trim()) {
      await db.query(
        `
          UPDATE users
          SET full_name = ?, position = ?, email = ?, business_location = ?, department = ?, is_admin = ?, password = ?
          WHERE id = ?
        `,
        [full_name, position, email, business_location, department, Number(is_admin || 0), password, id]
      );
    } else {
      await db.query(
        `
          UPDATE users
          SET full_name = ?, position = ?, email = ?, business_location = ?, department = ?, is_admin = ?
          WHERE id = ?
        `,
        [full_name, position, email, business_location, department, Number(is_admin || 0), id]
      );
    }

    res.json({ message: "회원 정보를 수정했습니다." });
  } catch (error) {
    console.error("Admin user update error:", error);
    res.status(500).json({ error: "회원 정보를 수정하지 못했습니다." });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const { search = "", noticesOnly = "false", limit = 100 } = req.query;
    const keyword = `%${String(search).trim()}%`;
    const parsedLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const noticesFilter = String(noticesOnly) === "true";

    const [rows] = await db.query(
      `
        SELECT
          id,
          title,
          content,
          author,
          author_id,
          category,
          is_notice,
          is_important,
          is_top,
          view_count,
          like_count,
          dislike_count,
          created_at,
          updated_at
        FROM post
        WHERE is_deleted = 0
          AND (? = 0 OR is_notice = 1)
          AND (
            ? = '%%'
            OR title LIKE ?
            OR content LIKE ?
            OR author LIKE ?
          )
        ORDER BY is_top DESC, is_important DESC, is_notice DESC, created_at DESC
        LIMIT ?
      `,
      [noticesFilter ? 1 : 0, keyword, keyword, keyword, keyword, parsedLimit]
    );

    res.json({ posts: rows });
  } catch (error) {
    console.error("Admin posts error:", error);
    res.status(500).json({ error: "게시글 목록을 불러오지 못했습니다." });
  }
});

router.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, is_notice, is_important, is_top } = req.body;

    const [rows] = await db.query("SELECT id FROM post WHERE id = ? AND is_deleted = 0 LIMIT 1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    await db.query(
      `
        UPDATE post
        SET title = ?, content = ?, category = ?, is_notice = ?, is_important = ?, is_top = ?, updated_at = NOW()
        WHERE id = ? AND is_deleted = 0
      `,
      [
        title,
        content,
        category || "general",
        Number(Boolean(is_notice)),
        Number(Boolean(is_important)),
        Number(Boolean(is_top)),
        id,
      ]
    );

    res.json({ message: "게시글을 수정했습니다." });
  } catch (error) {
    console.error("Admin post update error:", error);
    res.status(500).json({ error: "게시글을 수정하지 못했습니다." });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT id FROM post WHERE id = ? AND is_deleted = 0 LIMIT 1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    await db.query("UPDATE post SET is_deleted = 1, updated_at = NOW() WHERE id = ? AND is_deleted = 0", [id]);
    res.json({ message: "게시글을 삭제했습니다." });
  } catch (error) {
    console.error("Admin post delete error:", error);
    res.status(500).json({ error: "게시글을 삭제하지 못했습니다." });
  }
});

router.get("/notices", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        title,
        content,
        author,
        category,
        is_notice,
        is_important,
        is_top,
        created_at,
        updated_at
      FROM post
      WHERE is_deleted = 0 AND is_notice = 1
      ORDER BY is_top DESC, is_important DESC, created_at DESC
    `);

    res.json({ notices: rows });
  } catch (error) {
    console.error("Admin notices error:", error);
    res.status(500).json({ error: "공지사항을 불러오지 못했습니다." });
  }
});

router.post("/notices", async (req, res) => {
  try {
    const { title, content, category = "general", is_important = 0, is_top = 0 } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "제목과 내용을 입력해 주세요." });
    }

    const [result] = await db.query(
      `
        INSERT INTO post (
          title, content, author, author_id, category, is_notice, is_important, is_top, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, 1, ?, ?, NOW(), NOW())
      `,
      [
        title,
        content,
        req.user.full_name || "관리자",
        req.user.user_id || null,
        category,
        Number(Boolean(is_important)),
        Number(Boolean(is_top)),
      ]
    );

    res.status(201).json({ id: result.insertId, message: "공지사항을 등록했습니다." });
  } catch (error) {
    console.error("Admin notice create error:", error);
    res.status(500).json({ error: "공지사항을 등록하지 못했습니다." });
  }
});

router.put("/notices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category = "general", is_important = 0, is_top = 0 } = req.body;

    const [rows] = await db.query(
      "SELECT id FROM post WHERE id = ? AND is_deleted = 0 AND is_notice = 1 LIMIT 1",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "공지사항을 찾을 수 없습니다." });
    }

    await db.query(
      `
        UPDATE post
        SET title = ?, content = ?, category = ?, is_notice = 1, is_important = ?, is_top = ?, updated_at = NOW()
        WHERE id = ?
      `,
      [title, content, category, Number(Boolean(is_important)), Number(Boolean(is_top)), id]
    );

    res.json({ message: "공지사항을 수정했습니다." });
  } catch (error) {
    console.error("Admin notice update error:", error);
    res.status(500).json({ error: "공지사항을 수정하지 못했습니다." });
  }
});

router.delete("/notices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE post SET is_deleted = 1, updated_at = NOW() WHERE id = ? AND is_deleted = 0 AND is_notice = 1",
      [id]
    );
    res.json({ message: "공지사항을 삭제했습니다." });
  } catch (error) {
    console.error("Admin notice delete error:", error);
    res.status(500).json({ error: "공지사항을 삭제하지 못했습니다." });
  }
});

router.get("/popups", async (req, res) => {
  try {
    await ensurePopupTable();
    const [rows] = await db.query(`
      SELECT
        id,
        title,
        content,
        link_url,
        start_date,
        end_date,
        is_active,
        priority,
        created_by,
        created_at,
        updated_at
      FROM admin_popup
      ORDER BY is_active DESC, priority DESC, created_at DESC
    `);

    res.json({ popups: rows });
  } catch (error) {
    console.error("Admin popups error:", error);
    res.status(500).json({ error: "팝업 목록을 불러오지 못했습니다." });
  }
});

router.post("/popups", async (req, res) => {
  try {
    await ensurePopupTable();

    const {
      title,
      content,
      link_url = "",
      start_date = null,
      end_date = null,
      is_active = 1,
      priority = 0,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "팝업 제목과 내용을 입력해 주세요." });
    }

    const [result] = await db.query(
      `
        INSERT INTO admin_popup (
          title, content, link_url, start_date, end_date, is_active, priority, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        content,
        link_url || null,
        normalizeDateTime(start_date),
        normalizeDateTime(end_date),
        Number(Boolean(is_active)),
        Number(priority || 0),
        req.user.full_name || "관리자",
      ]
    );

    res.status(201).json({ id: result.insertId, message: "팝업을 등록했습니다." });
  } catch (error) {
    console.error("Admin popup create error:", error);
    res.status(500).json({ error: "팝업을 등록하지 못했습니다." });
  }
});

router.put("/popups/:id", async (req, res) => {
  try {
    await ensurePopupTable();

    const { id } = req.params;
    const {
      title,
      content,
      link_url = "",
      start_date = null,
      end_date = null,
      is_active = 1,
      priority = 0,
    } = req.body;

    await db.query(
      `
        UPDATE admin_popup
        SET title = ?, content = ?, link_url = ?, start_date = ?, end_date = ?, is_active = ?, priority = ?, updated_at = NOW()
        WHERE id = ?
      `,
      [
        title,
        content,
        link_url || null,
        normalizeDateTime(start_date),
        normalizeDateTime(end_date),
        Number(Boolean(is_active)),
        Number(priority || 0),
        id,
      ]
    );

    res.json({ message: "팝업을 수정했습니다." });
  } catch (error) {
    console.error("Admin popup update error:", error);
    res.status(500).json({ error: "팝업을 수정하지 못했습니다." });
  }
});

router.delete("/popups/:id", async (req, res) => {
  try {
    await ensurePopupTable();
    const { id } = req.params;
    await db.query("DELETE FROM admin_popup WHERE id = ?", [id]);
    res.json({ message: "팝업을 삭제했습니다." });
  } catch (error) {
    console.error("Admin popup delete error:", error);
    res.status(500).json({ error: "팝업을 삭제하지 못했습니다." });
  }
});

module.exports = router;
