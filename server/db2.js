const { Sequelize } = require("sequelize");

// ✅ Sequelize 인스턴스 생성
const sequelize = new Sequelize("Koinfra_mat", "root", "gkl123!@#", {
  host: "localhost",
  dialect: "mysql",
  logging: false, // SQL 쿼리 로그를 비활성화하려면 false로 설정
});

module.exports = sequelize;
