const express = require("express");
const router = express.Router();
const sequelize = require("../db2");

// 추천/비추천 처리
router.post("/:id/reaction", async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, reaction_type } = req.body;

        if (!user_id || !reaction_type || !['like', 'dislike'].includes(reaction_type)) {
            return res.status(400).json({ error: "올바른 사용자 ID와 반응 타입을 입력하세요." });
        }

        // 트랜잭션 시작
        const transaction = await sequelize.transaction();

        try {
            // 기존 반응 확인
            const [existingReaction] = await sequelize.query(`
                SELECT reaction_type FROM post_reaction 
                WHERE post_id = ? AND user_id = ?
            `, {
                replacements: [id, user_id],
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            if (existingReaction.length > 0) {
                const oldReaction = existingReaction[0].reaction_type;

                if (oldReaction === reaction_type) {
                    // 같은 반응이면 취소
                    await sequelize.query(`
                        DELETE FROM post_reaction 
                        WHERE post_id = ? AND user_id = ?
                    `, {
                        replacements: [id, user_id],
                        type: sequelize.QueryTypes.DELETE,
                        transaction
                    });

                    // 게시글 카운트 감소
                    const countField = oldReaction === 'like' ? 'like_count' : 'dislike_count';
                    await sequelize.query(`
                        UPDATE post 
                        SET ${countField} = ${countField} - 1 
                        WHERE id = ?
                    `, {
                        replacements: [id],
                        type: sequelize.QueryTypes.UPDATE,
                        transaction
                    });

                    await transaction.commit();
                    return res.json({ message: "반응이 취소되었습니다." });
                } else {
                    // 다른 반응이면 변경
                    await sequelize.query(`
                        UPDATE post_reaction 
                        SET reaction_type = ? 
                        WHERE post_id = ? AND user_id = ?
                    `, {
                        replacements: [reaction_type, id, user_id],
                        type: sequelize.QueryTypes.UPDATE,
                        transaction
                    });

                    // 게시글 카운트 업데이트
                    const oldCountField = oldReaction === 'like' ? 'like_count' : 'dislike_count';
                    const newCountField = reaction_type === 'like' ? 'like_count' : 'dislike_count';

                    await sequelize.query(`
                        UPDATE post 
                        SET ${oldCountField} = ${oldCountField} - 1, 
                            ${newCountField} = ${newCountField} + 1 
                        WHERE id = ?
                    `, {
                        replacements: [id],
                        type: sequelize.QueryTypes.UPDATE,
                        transaction
                    });

                    await transaction.commit();
                    return res.json({ message: "반응이 변경되었습니다." });
                }
            } else {
                // 새로운 반응 추가
                await sequelize.query(`
                    INSERT INTO post_reaction (post_id, user_id, reaction_type)
                    VALUES (?, ?, ?)
                `, {
                    replacements: [id, user_id, reaction_type],
                    type: sequelize.QueryTypes.INSERT,
                    transaction
                });

                // 게시글 카운트 증가
                const countField = reaction_type === 'like' ? 'like_count' : 'dislike_count';
                await sequelize.query(`
                    UPDATE post 
                    SET ${countField} = ${countField} + 1 
                    WHERE id = ?
                `, {
                    replacements: [id],
                    type: sequelize.QueryTypes.UPDATE,
                    transaction
                });

                await transaction.commit();
                return res.json({ message: "반응이 추가되었습니다." });
            }
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error("반응 처리 오류:", error);
        res.status(500).json({ error: "반응 처리 중 오류 발생" });
    }
});

// 사용자의 게시글 반응 상태 조회
router.get("/:id/reaction/:user_id", async (req, res) => {
    try {
        const { id, user_id } = req.params;

        const [reaction] = await sequelize.query(`
            SELECT reaction_type 
            FROM post_reaction 
            WHERE post_id = ? AND user_id = ?
        `, {
            replacements: [id, user_id],
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            reaction_type: reaction.length > 0 ? reaction[0].reaction_type : null
        });
    } catch (error) {
        console.error("반응 상태 조회 오류:", error);
        res.status(500).json({ error: "반응 상태 조회 중 오류 발생" });
    }
});

module.exports = router; 