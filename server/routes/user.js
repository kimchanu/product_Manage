const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.get('/activity', async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT id, title, category, created_at FROM post WHERE is_deleted = 0
       AND (author_id = ? OR (author_id IS NULL AND author = ?
         AND (SELECT COUNT(*) FROM users WHERE full_name = ?) = 1))
       ORDER BY created_at DESC, id DESC LIMIT 5`,
      [req.user.user_id, req.user.full_name, req.user.full_name]
    );
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: '내 활동을 불러오지 못했습니다.' });
  }
});

router.post('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || !currentPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
    return res.status(400).json({ message: '현재 비밀번호와 4자 이상의 새 비밀번호를 입력해주세요.' });
  }
  try {
    const [result] = await db.query('UPDATE users SET password = ? WHERE id = ? AND password = ?', [newPassword, req.user.user_id, currentPassword]);
    if (!result.affectedRows) return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
    res.json({ message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '비밀번호를 변경하지 못했습니다.' });
  }
});

module.exports = router;
