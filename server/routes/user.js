const express = require('express');
const router = express.Router();
const db = require('../db');

// 비밀번호 변경 API
router.post('/change-password', (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    // 1. 현재 비밀번호 확인
    const checkQuery = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(checkQuery, [username, currentPassword], (err, results) => {
        if (err) {
            console.error('비밀번호 확인 중 오류:', err);
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
        }

        // 2. 새 비밀번호로 업데이트
        const updateQuery = 'UPDATE users SET password = ? WHERE username = ?';
        db.query(updateQuery, [newPassword, username], (err, result) => {
            if (err) {
                console.error('비밀번호 업데이트 중 오류:', err);
                return res.status(500).json({ message: '비밀번호 변경 실패' });
            }

            res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
        });
    });
});

module.exports = router;
