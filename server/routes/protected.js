const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET_KEY = "your_jwt_secret_key"; // JWT 서명 키 (환경 변수로 관리하는 게 좋음)

// 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // "Bearer 토큰값"에서 토큰 추출

  if (!token) {
    return res.status(401).json({ message: "토큰이 없습니다. 인증이 필요합니다." });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
    }
    req.user = user; // 요청 객체에 사용자 정보 추가
    next();
  });
};

// 보호된 라우트
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "보호된 페이지 접근 성공!", user: req.user });
});

module.exports = router;
