const mysql = require("mysql2");

// ✅ MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "gkl123!@#",
  database: "Koinfra_mat",
  waitForConnections: true,
  connectionLimit: 10, // 최대 연결 수 설정
  queueLimit: 0,
});

// ✅ Promise 기반으로 변환
const db = pool.promise();

module.exports = db;
