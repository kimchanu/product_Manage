const express = require("express");
const router = express.Router();
const sequelize = require("../db2");
const authMiddleware = require("../middleware/authMiddleware");

// 테스트용 라우트
router.get("/test", (req, res) => {
    res.json({ message: "Post API is working!" });
});

// 게시글 목록 조회
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [posts, totalCount] = await Promise.all([
            sequelize.query(`
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
                    (SELECT COUNT(*) FROM post_comment WHERE post_id = p.id AND is_deleted = 0) as comment_count
                FROM post p 
                WHERE p.is_deleted = 0 
                ORDER BY p.is_top DESC, p.is_important DESC, p.is_notice DESC, p.created_at DESC 
                LIMIT ? OFFSET ?
            `, {
                replacements: [parseInt(limit), offset],
                type: sequelize.QueryTypes.SELECT
            }),
            sequelize.query(`
                SELECT COUNT(*) as total 
                FROM post 
                WHERE is_deleted = 0
            `, {
                type: sequelize.QueryTypes.SELECT
            })
        ]);

        res.json({
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount[0].total / limit),
                totalCount: totalCount[0].total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("게시글 목록 조회 오류:", error);
        res.status(500).json({ error: "게시글 목록을 불러오는 중 오류 발생" });
    }
});

// IP 주소 가져오기 헬퍼 함수
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip ||
           'unknown';
};

// post_view 테이블 생성 (없으면)
const ensureViewTable = async () => {
    try {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS post_view (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                ip_address VARCHAR(45) NOT NULL,
                view_date DATE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_post_ip_date (post_id, ip_address, view_date),
                INDEX idx_view_date (view_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `, { type: sequelize.QueryTypes.RAW });
    } catch (error) {
        console.error("post_view 테이블 생성/확인 오류:", error);
    }
};

// 게시글 상세 조회
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log("게시글 상세 조회 요청 - ID:", id);

        // post_view 테이블 확인/생성
        await ensureViewTable();

        // IP 주소 가져오기
        const ipAddress = getClientIp(req);
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식

        // 오늘 같은 IP에서 이 게시글을 조회한 기록이 있는지 확인
        const existingViews = await sequelize.query(`
            SELECT id FROM post_view 
            WHERE post_id = ? AND ip_address = ? AND view_date = ?
            LIMIT 1
        `, {
            replacements: [id, ipAddress, today],
            type: sequelize.QueryTypes.SELECT
        });

        // 오늘 조회 기록이 없으면 조회수 증가
        if (!existingViews || existingViews.length === 0) {
            // 조회수 증가
            await sequelize.query(`
                UPDATE post 
                SET view_count = view_count + 1 
                WHERE id = ? AND is_deleted = 0
            `, {
                replacements: [id],
                type: sequelize.QueryTypes.UPDATE
            });

            // 조회 기록 저장
            try {
                await sequelize.query(`
                    INSERT INTO post_view (post_id, ip_address, view_date, created_at)
                    VALUES (?, ?, ?, NOW())
                `, {
                    replacements: [id, ipAddress, today],
                    type: sequelize.QueryTypes.INSERT
                });
            } catch (viewError) {
                console.error("조회 기록 저장 오류:", viewError);
                // 조회 기록 저장 실패해도 게시글은 반환
            }
        }

        // 게시글 조회
        const posts = await sequelize.query(`
            SELECT 
                p.id, 
                p.title, 
                p.content, 
                p.author, 
                p.author_id,
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
        `, {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT
        });

        console.log("조회된 게시글:", posts);

        if (posts.length === 0) {
            console.log("게시글을 찾을 수 없음");
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        console.log("게시글 반환:", posts[0]);
        res.json(posts[0]);
    } catch (error) {
        console.error("게시글 상세 조회 오류:", error);
        res.status(500).json({ error: "게시글을 불러오는 중 오류 발생" });
    }
});

// 게시글 작성
router.post("/", async (req, res) => {
    try {
        const { title, content, author, author_id, category, is_notice, is_important, is_top } = req.body;

        if (!title || !content || !author) {
            return res.status(400).json({ error: "제목, 내용, 작성자를 모두 입력하세요." });
        }

        const [result] = await sequelize.query(`
            INSERT INTO post (title, content, author, author_id, category, is_notice, is_important, is_top, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, {
            replacements: [
                title,
                content,
                author,
                author_id || null,
                category || 'general',
                is_notice || 0,
                is_important || 0,
                is_top || 0
            ],
            type: sequelize.QueryTypes.INSERT
        });

        res.status(201).json({
            id: result,
            message: "게시글이 성공적으로 작성되었습니다."
        });
    } catch (error) {
        console.error("게시글 작성 오류:", error);
        res.status(500).json({ error: "게시글 작성 중 오류 발생" });
    }
});

// 게시글 수정
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, author_id, is_notice, is_important, is_top } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: "제목과 내용을 모두 입력하세요." });
        }

        const [result] = await sequelize.query(`
            UPDATE post 
            SET title = ?, content = ?, is_notice = ?, is_important = ?, is_top = ?, updated_at = NOW()
            WHERE id = ? AND is_deleted = 0
        `, {
            replacements: [title, content, is_notice || 0, is_important || 0, is_top || 0, id],
            type: sequelize.QueryTypes.UPDATE
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        res.json({ message: "게시글이 성공적으로 수정되었습니다." });
    } catch (error) {
        console.error("게시글 수정 오류:", error);
        res.status(500).json({ error: "게시글 수정 중 오류 발생" });
    }
});

// 게시글 삭제 (소프트 삭제)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, admin } = req.user;

        // 게시글 정보 조회
        const posts = await sequelize.query(
            "SELECT author_id FROM post WHERE id = ? AND is_deleted = 0",
            { replacements: [id], type: sequelize.QueryTypes.SELECT }
        );
        if (posts.length === 0) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }
        const post = posts[0];

        // 권한 체크: 작성자이거나, admin >= 2
        if (user_id !== post.author_id && admin < 2) {
            return res.status(403).json({ error: "삭제 권한이 없습니다." });
        }

        // 삭제(소프트 삭제)
        const [result] = await sequelize.query(
            "UPDATE post SET is_deleted = 1, updated_at = NOW() WHERE id = ? AND is_deleted = 0",
            { replacements: [id], type: sequelize.QueryTypes.UPDATE }
        );

        if ((typeof result === "object" && result.affectedRows === 0) || (typeof result === "number" && result === 0)) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        res.json({ message: "게시글이 성공적으로 삭제되었습니다." });
    } catch (error) {
        console.error("게시글 삭제 오류:", error);
        res.status(500).json({ error: "게시글 삭제 중 오류 발생" });
    }
});

module.exports = router; 