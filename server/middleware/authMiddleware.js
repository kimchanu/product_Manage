const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error("No Authorization header provided");
    return res.status(401).json({ error: "No token provided" });
  }

  // Bearer <token> 형식 체크
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    console.error("Authorization header format is invalid:", authHeader);
    return res.status(401).json({ error: "Invalid token format" });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_super_secret_jwt_key_2024");
    req.user = decoded;
    // 개발용: payload 로그
    console.log("JWT payload:", decoded);
    next();
  } catch (err) {
    console.error("JWT 인증 오류:", err.message, "토큰:", token);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
