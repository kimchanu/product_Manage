const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db"); // 데이터베이스 연결 모듈
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("받은 요청 데이터:", req.body); // 요청 데이터 확인

  if (!email || !password) {
    return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
  }

  try {
    // ✅ MySQL에서 사용자 정보 조회
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "아이디 또는 비밀번호가 잘못되었습니다." });
    }

    const user = rows[0];

    // ✅ 비밀번호 비교 (일반 문자열 비교)
    if (password !== user.password) {
      return res.status(400).json({ message: "아이디 또는 비밀번호가 잘못되었습니다." });
    }

    // ✅ JWT 토큰 생성
    const authToken = jwt.sign(
      { user_id: user.id, full_name: user.full_name, business_location: user.business_location, department: user.department, admin: user.is_admin },
      process.env.JWT_SECRET || "your_super_secret_jwt_key_2024",
      { expiresIn: "24h" }
    );

    res.json({ message: "로그인 성공!", authToken });
  } catch (err) {
    console.error("❌ 데이터베이스 오류:", err);
    res.status(500).json({ message: "서버 오류! 다시 시도해주세요." });
  }
});

module.exports = router;
