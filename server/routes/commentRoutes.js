const express = require("express");
const router = express.Router();
const sequelize = require("../db2");

// 댓글 목록 조회
router.get("/:id/comments", async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const [comments, totalCount] = await Promise.all([
            sequelize.query(`
                SELECT 
                    c.id,
                    c.post_id,
                    c.content,
                    c.author,
                    c.author_id,
                    c.parent_id,
                    c.created_at,
                    c.updated_at,
                    p.author as parent_author
                FROM post_comment c
                LEFT JOIN post_comment p ON c.parent_id = p.id
                WHERE c.post_id = ? AND c.is_deleted = 0
                ORDER BY c.parent_id ASC, c.created_at ASC
                LIMIT ? OFFSET ?
            `, {
                replacements: [id, parseInt(limit), offset],
                type: sequelize.QueryTypes.SELECT
            }),
            sequelize.query(`
                SELECT COUNT(*) as total 
                FROM post_comment 
                WHERE post_id = ? AND is_deleted = 0
            `, {
                replacements: [id],
                type: sequelize.QueryTypes.SELECT
            })
        ]);

        res.json({
            comments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount[0].total / limit),
                totalCount: totalCount[0].total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("댓글 목록 조회 오류:", error);
        res.status(500).json({ error: "댓글 목록을 불러오는 중 오류 발생" });
    }
});

// 댓글 작성
router.post("/:id/comments", async (req, res) => {
    try {
        const { id } = req.params;
        const { content, author, author_id, parent_id } = req.body;

        if (!content || !author) {
            return res.status(400).json({ error: "댓글 내용과 작성자를 입력하세요." });
        }

        // 게시글 존재 확인
        const [post] = await sequelize.query(`
            SELECT id FROM post WHERE id = ? AND is_deleted = 0
        `, {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT
        });

        if (post.length === 0) {
            return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
        }

        // 대댓글인 경우 부모 댓글 확인
        if (parent_id) {
            const [parentComment] = await sequelize.query(`
                SELECT id FROM post_comment WHERE id = ? AND post_id = ? AND is_deleted = 0
            `, {
                replacements: [parent_id, id],
                type: sequelize.QueryTypes.SELECT
            });

            if (parentComment.length === 0) {
                return res.status(404).json({ error: "부모 댓글을 찾을 수 없습니다." });
            }
        }

        const [result] = await sequelize.query(`
            INSERT INTO post_comment (post_id, content, author, author_id, parent_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, {
            replacements: [id, content, author, author_id || null, parent_id || null],
            type: sequelize.QueryTypes.INSERT
        });

        res.status(201).json({
            id: result,
            message: "댓글이 성공적으로 작성되었습니다."
        });
    } catch (error) {
        console.error("댓글 작성 오류:", error);
        res.status(500).json({ error: "댓글 작성 중 오류 발생" });
    }
});

// 댓글 수정
router.put("/comments/:comment_id", async (req, res) => {
    try {
        const { comment_id } = req.params;
        const { content, author_id } = req.body;

        if (!content) {
            return res.status(400).json({ error: "댓글 내용을 입력하세요." });
        }

        const [result] = await sequelize.query(`
            UPDATE post_comment 
            SET content = ?, updated_at = NOW()
            WHERE id = ? AND is_deleted = 0
        `, {
            replacements: [content, comment_id],
            type: sequelize.QueryTypes.UPDATE
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
        }

        res.json({ message: "댓글이 성공적으로 수정되었습니다." });
    } catch (error) {
        console.error("댓글 수정 오류:", error);
        res.status(500).json({ error: "댓글 수정 중 오류 발생" });
    }
});

// 댓글 삭제 (소프트 삭제)
router.delete("/comments/:comment_id", async (req, res) => {
    try {
        const { comment_id } = req.params;

        const [result] = await sequelize.query(`
            UPDATE post_comment 
            SET is_deleted = 1, updated_at = NOW()
            WHERE id = ? AND is_deleted = 0
        `, {
            replacements: [comment_id],
            type: sequelize.QueryTypes.UPDATE
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
        }

        res.json({ message: "댓글이 성공적으로 삭제되었습니다." });
    } catch (error) {
        console.error("댓글 삭제 오류:", error);
        res.status(500).json({ error: "댓글 삭제 중 오류 발생" });
    }
});

module.exports = router; 