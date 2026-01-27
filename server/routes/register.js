const express = require("express");
const db = require("../db"); // Promise pool
const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, full_name, position, email, business_location, department } = req.body;

  if (!username || !password || !full_name || !position || !email || !business_location || !department) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  if (!/^\d{7}$/.test(username)) {
    return res.status(400).json({ message: "아이디는 7자리 숫자만 가능합니다." });
  }

  const validPositions = ["사원", "대리", "과장", "차장", "부장"];
  if (!validPositions.includes(position)) {
    return res.status(400).json({ message: "직급이 유효하지 않습니다." });
  }

  const validBusinessLocations = ["GK사업소", "천마사업소", "을숙도사업소", "강남사업소", "수원사업소", "본사"];
  if (!validBusinessLocations.includes(business_location)) {
    return res.status(400).json({ message: "사업소가 유효하지 않습니다." });
  }

  const validDepartments = ["ITS", "기전", "시설", "관리", "경영지원"];
  if (!validDepartments.includes(department)) {
    return res.status(400).json({ message: "부서가 유효하지 않습니다." });
  }

  try {
    // 중복 아이디 검사
    console.log("중복 아이디 검사 쿼리 실행, username:", username);
    const [checkResults] = await db.query("SELECT username FROM users WHERE username = ?", [username]);

    console.log("중복 검사 결과:", checkResults);

    if (checkResults.length > 0) {
      return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
    }

    // 회원가입 쿼리
    const insertSql = `
      INSERT INTO users (username, password, full_name, position, email, business_location, department)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [username, password, full_name, position, email, business_location, department];

    console.log("회원가입 쿼리 실행, 값:", values);
    const [result] = await db.query(insertSql, values);

    console.log("회원가입 성공, 결과:", result);
    res.status(201).json({ message: "회원가입 성공!" });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({ message: "서버 오류로 회원가입에 실패했습니다." });
  }
});

module.exports = router;
