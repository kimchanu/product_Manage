const express = require("express");
const router = express.Router();
const sequelize = require("../db2");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/test", (req, res) => {
    res.json({ message: "Post API is working!" });
});

router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        const offset = (parsedPage - 1) * parsedLimit;

        const [posts, totalCount] = await Promise.all([
            sequelize.query(
                `
                SELECT
                    p.id,
                    p.title,
                    p.content,
                    p.author,
                    p.author_id,
                    p.category,
                    p.is_notice,
                    p.is_important,
                    p.is_top,
                    p.view_count,
                    p.like_count,
                    p.dislike_count,
                    p.created_at,
                    p.updated_at,
                    (SELECT COUNT(*) FROM post_comment WHERE post_id = p.id AND is_deleted = 0) AS comment_count
                FROM post p
                WHERE p.is_deleted = 0
                ORDER BY p.is_top DESC, p.is_important DESC, p.is_notice DESC, p.created_at DESC
                LIMIT ? OFFSET ?
                `,
                {
                    replacements: [parsedLimit, offset],
                    type: sequelize.QueryTypes.SELECT,
                }
            ),
            sequelize.query(
                `
                SELECT COUNT(*) AS total
                FROM post
                WHERE is_deleted = 0
                `,
                {
                    type: sequelize.QueryTypes.SELECT,
                }
            ),
        ]);

        res.json({
            posts,
            pagination: {
                currentPage: parsedPage,
                totalPages: Math.ceil(totalCount[0].total / parsedLimit),
                totalCount: totalCount[0].total,
                limit: parsedLimit,
            },
        });
    } catch (error) {
        console.error("Post list error:", error);
        res.status(500).json({ error: "게시글 목록을 불러오는 중 오류가 발생했습니다." });
    }
});

const getClientIp = (req) => {
    return (
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.headers["x-real-ip"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        "unknown"
    );
};

const ensureViewTable = async () => {
    try {
        await sequelize.query(
            `
            CREATE TABLE IF NOT EXISTS post_view (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                ip_address VARCHAR(45) NOT NULL,
                view_date DATE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_post_ip_date (post_id, ip_address, view_date),
                INDEX idx_view_date (view_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `,
            { type: sequelize.QueryTypes.RAW }
        );
    } catch (error) {
        console.error("post_view ensure error:", error);
    }
};

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const skipViewCount = req.headers["x-skip-view-count"] === "true";

        await ensureViewTable();

        if (!skipViewCount) {
            const ipAddress = getClientIp(req);
            const today = new Date().toISOString().split("T")[0];

            const existingViews = await sequelize.query(
                `
                SELECT id
                FROM post_view
                WHERE post_id = ? AND ip_address = ? AND view_date = ?
                LIMIT 1
                `,
                {
                    replacements: [id, ipAddress, today],
                    type: sequelize.QueryTypes.SELECT,
                }
            );

            if (!existingViews || existingViews.length === 0) {
                await sequelize.query(
                    `
                    UPDATE post
                    SET view_count = view_count + 1
                    WHERE id = ? AND is_deleted = 0
                    `,
                    {
                        replacements: [id],
                        type: sequelize.QueryTypes.UPDATE,
                    }
                );

                try {
                    await sequelize.query(
                        `
                        INSERT INTO post_view (post_id, ip_address, view_date, created_at)
                        VALUES (?, ?, ?, NOW())
                        `,
                        {
                            replacements: [id, ipAddress, today],
                            type: sequelize.QueryTypes.INSERT,
                        }
                    );
                } catch (viewError) {
                    console.error("post_view insert error:", viewError);
                }
            }
        }

        const posts = await sequelize.query(
            `
            SELECT
                p.id,
                p.title,
                p.content,
                p.author,
                p.author_id,
                p.category,
                p.is_notice,
                p.is_important,
                p.is_top,
                p.view_count,
                p.like_count,
                p.dislike_count,
                p.created_at,
                p.updated_at
            FROM post p
            WHERE p.id = ? AND p.is_deleted = 0
            `,
            {
                replacements: [id],
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (posts.length === 0) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        res.json(posts[0]);
    } catch (error) {
        console.error("Post detail error:", error);
        res.status(500).json({ error: "게시글을 불러오는 중 오류가 발생했습니다." });
    }
});

router.post("/", async (req, res) => {
    try {
        const { title, content, author, author_id, category, is_notice, is_important, is_top } = req.body;

        if (!title || !content || !author) {
            return res.status(400).json({ error: "제목, 내용, 작성자를 모두 입력해 주세요." });
        }

        const [result] = await sequelize.query(
            `
            INSERT INTO post (title, content, author, author_id, category, is_notice, is_important, is_top, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `,
            {
                replacements: [
                    title,
                    content,
                    author,
                    author_id || null,
                    category || "general",
                    is_notice || 0,
                    is_important || 0,
                    is_top || 0,
                ],
                type: sequelize.QueryTypes.INSERT,
            }
        );

        res.status(201).json({
            id: result,
            message: "게시글이 작성되었습니다.",
        });
    } catch (error) {
        console.error("Post create error:", error);
        res.status(500).json({ error: "게시글 작성 중 오류가 발생했습니다." });
    }
});

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, is_notice, is_important, is_top } = req.body;
        const { user_id, admin, full_name } = req.user;

        if (!title || !content) {
            return res.status(400).json({ error: "제목과 내용을 모두 입력해 주세요." });
        }

        const posts = await sequelize.query(
            "SELECT author_id, author FROM post WHERE id = ? AND is_deleted = 0",
            { replacements: [id], type: sequelize.QueryTypes.SELECT }
        );

        if (posts.length === 0) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        const post = posts[0];
        const isAuthorById = post.author_id && Number(post.author_id) === Number(user_id);
        const isAuthorByName = !post.author_id && post.author && post.author === full_name;
        const isAdmin = Number(admin || 0) >= 1;

        if (!isAuthorById && !isAuthorByName && !isAdmin) {
            return res.status(403).json({ error: "수정 권한이 없습니다." });
        }

        const [result] = await sequelize.query(
            `
            UPDATE post
            SET title = ?, content = ?, category = ?, is_notice = ?, is_important = ?, is_top = ?, updated_at = NOW()
            WHERE id = ? AND is_deleted = 0
            `,
            {
                replacements: [title, content, category || "general", is_notice || 0, is_important || 0, is_top || 0, id],
                type: sequelize.QueryTypes.UPDATE,
            }
        );

        if ((typeof result === "object" && result.affectedRows === 0) || (typeof result === "number" && result === 0)) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        res.json({ message: "게시글이 수정되었습니다." });
    } catch (error) {
        console.error("Post update error:", error);
        res.status(500).json({ error: "게시글 수정 중 오류가 발생했습니다." });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, admin, full_name } = req.user;

        const posts = await sequelize.query(
            "SELECT author_id, author FROM post WHERE id = ? AND is_deleted = 0",
            { replacements: [id], type: sequelize.QueryTypes.SELECT }
        );

        if (posts.length === 0) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        const post = posts[0];
        const isAuthorById = post.author_id && Number(post.author_id) === Number(user_id);
        const isAuthorByName = !post.author_id && post.author && post.author === full_name;
        const isAdmin = Number(admin || 0) >= 1;

        if (!isAuthorById && !isAuthorByName && !isAdmin) {
            return res.status(403).json({ error: "삭제 권한이 없습니다." });
        }

        const [result] = await sequelize.query(
            "UPDATE post SET is_deleted = 1, updated_at = NOW() WHERE id = ? AND is_deleted = 0",
            { replacements: [id], type: sequelize.QueryTypes.UPDATE }
        );

        if ((typeof result === "object" && result.affectedRows === 0) || (typeof result === "number" && result === 0)) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        res.json({ message: "게시글이 삭제되었습니다." });
    } catch (error) {
        console.error("Post delete error:", error);
        res.status(500).json({ error: "게시글 삭제 중 오류가 발생했습니다." });
    }
});

module.exports = router;
