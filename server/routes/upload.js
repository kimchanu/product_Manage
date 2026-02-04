const express = require("express");
const router = express.Router();
const db = require("../db"); // DB 연결 파일 추가

router.post("/", async (req, res) => {
  const dataSize = Buffer.byteLength(JSON.stringify(req.body), "utf8") / (1024 * 1024); // MB 변환
  console.log(`🔹 데이터 크기: ${dataSize.toFixed(2)}MB`);

  const { businessLocation, department, username, csvData } = req.body;
  if (!businessLocation || !department || !csvData.length) {
    return res.status(400).json({ message: "Check business location, department, and CSV data!" });
  }

  // ✅ 테이블명 동적 생성
  const inputTable = `${businessLocation}_${department}_input`;
  const outputTable = `${businessLocation}_${department}_output`;
  const productTable = `${businessLocation}_${department}_product`;

  try {
    // ✅ 기존 테이블 존재 여부 확인
    const tableExists = await checkTableExists(inputTable);
    if (tableExists) {
      return res.status(400).json({ message: "이미 등록하셨습니다. 저장이 안되었습니다!" });
    }

    // ✅ 테이블 생성
    await createTables(inputTable, outputTable, productTable);

    // ✅ 데이터 삽입 (트랜잭션 적용)
    await insertDataWithTransaction(inputTable, outputTable, productTable, businessLocation, department, username, csvData);

    res.status(200).json({ message: "Data saved successfully!" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error!" });
  }
});

// ✅ 테이블 존재 여부 확인 함수
async function checkTableExists(tableName) {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
      [tableName]
    );
    return rows[0].count > 0;
  } catch (err) {
    console.error("❌ Table existence check failed:", err);
    throw err;
  } finally {
    connection.release();
  }
}

// ✅ 테이블 생성 함수
async function createTables(inputTable, outputTable, productTable) {
  const createInputTable = `
    CREATE TABLE IF NOT EXISTS ${inputTable} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      business_location VARCHAR(50),
      department VARCHAR(50),
      user_id VARCHAR(50),
      material_id VARCHAR(50),
      quantity INT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      comment TEXT
    )`;

  const createOutputTable = `
    CREATE TABLE IF NOT EXISTS ${outputTable} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      business_location VARCHAR(50),
      department VARCHAR(50),
      user_id VARCHAR(50),
      material_id VARCHAR(50),
      quantity INT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      comment TEXT
    )`;

  const createProductTable = `
    CREATE TABLE IF NOT EXISTS ${productTable} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      business_location VARCHAR(50),
      department VARCHAR(50),
      user_id VARCHAR(50),
      material_id VARCHAR(50),
      material_code VARCHAR(50),
      location VARCHAR(50),
      big_category VARCHAR(50),
      category VARCHAR(50),
      sub_category VARCHAR(50),
      name VARCHAR(100),
      specification VARCHAR(100),
      manufacturer VARCHAR(50),
      supplier VARCHAR(50),
      unit VARCHAR(20),
      price INT,
      appropriate INT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;

  const connection = await db.getConnection(); // getConnection() 호출
  try {
    await connection.beginTransaction(); // ✅ 트랜잭션 시작

    await connection.query(createInputTable);
    await connection.query(createOutputTable);
    await connection.query(createProductTable);

    await connection.commit(); // ✅ 테이블 생성 성공 시 커밋
    console.log("✅ Tables created successfully");
  } catch (err) {
    await connection.rollback(); // ❌ 실패 시 롤백
    console.error("❌ Table creation failed, rolling back:", err);
    throw err;
  } finally {
    connection.release(); // ✅ 연결 해제
  }
}

// ✅ 숫자 변환 함수
const parseNumber = (value) => {
  if (!value) return 0;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === "") return 0;
    return parseFloat(trimmed.replace(/,/g, "")) || 0;
  }
  return Number(value) || 0;
};

// ✅ 트랜잭션 적용된 데이터 삽입 함수
async function insertDataWithTransaction(inputTable, outputTable, productTable, businessLocation, department, username, csvData) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 전년도 12월 31일 날짜 생성
    const lastYear = new Date().getFullYear() - 1;
    const defaultDate = new Date(lastYear, 11, 31); // 11은 12월을 의미 (0부터 시작하므로)

    for (const item of csvData) {
      const cleanItem = {};
      for (const key in item) {
        const trimmedKey = key.trim().replace(/\s+/g, ""); // 공백 전체 제거 (또는 .trim()만 써도 OK)
        cleanItem[trimmedKey] = item[key];
      }

      // ✅ 입고 데이터 삽입
      const inputData = [
        businessLocation, department, username, cleanItem.id, parseNumber(cleanItem["입고수량"]), defaultDate, cleanItem["코멘트"] || ""
      ];
      const inputQuery = `
        INSERT INTO ${inputTable} (business_location, department, user_id, material_id, quantity, date, comment) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
      await connection.query(inputQuery, inputData);

      // ✅ 출고 데이터 삽입
      const outputData = [
        businessLocation, department, username, cleanItem.id, parseNumber(cleanItem["출고수량"]), defaultDate, cleanItem["코멘트"] || ""
      ];
      const outputQuery = `
        INSERT INTO ${outputTable} (business_location, department, user_id, material_id, quantity, date, comment) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
      await connection.query(outputQuery, outputData);

      // ✅ 자재 데이터 삽입
      const productData = [
        businessLocation, department, username, cleanItem.id, cleanItem["자재코드"], cleanItem["위치"], cleanItem["대분류"], cleanItem["중분류"], cleanItem["소분류"],
        cleanItem["품명"], cleanItem["규격"], cleanItem["제조사"], cleanItem["거래처"], cleanItem["단위"], parseNumber(cleanItem["단가"]), parseNumber(cleanItem["적정수량"]) || 0, defaultDate
      ];
      const productQuery = `
        INSERT INTO ${productTable} (business_location, department, user_id, material_id, material_code, location, big_category, category, sub_category, 
        name, specification, manufacturer, supplier, unit, price, appropriate, date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.query(productQuery, productData);
    }

    await connection.commit();
    console.log("✅ All data inserted successfully");
  } catch (err) {
    await connection.rollback();
    console.error("❌ Transaction failed, all inserts rolled back:", err);
    throw err;
  } finally {
    connection.release();
  }
}

// ✅ 테이블 생성 전용 API
router.post("/create-tables", async (req, res) => {
  const { businessLocation, department } = req.body;
  
  if (!businessLocation || !department) {
    return res.status(400).json({ 
      success: false,
      message: "사업소와 부서를 선택해주세요!" 
    });
  }

  // ✅ 테이블명 동적 생성
  const inputTable = `${businessLocation}_${department}_input`;
  const outputTable = `${businessLocation}_${department}_output`;
  const productTable = `${businessLocation}_${department}_product`;

  try {
    // ✅ 기존 테이블 존재 여부 확인
    const tableExists = await checkTableExists(inputTable);
    if (tableExists) {
      return res.status(400).json({ 
        success: false,
        message: `이미 테이블이 존재합니다. (${inputTable})` 
      });
    }

    // ✅ 테이블 생성
    await createTables(inputTable, outputTable, productTable);

    res.status(200).json({ 
      success: true,
      message: `테이블이 성공적으로 생성되었습니다. (${inputTable}, ${outputTable}, ${productTable})` 
    });
  } catch (err) {
    console.error("❌ 테이블 생성 오류:", err);
    res.status(500).json({ 
      success: false,
      message: "테이블 생성 중 오류가 발생했습니다.",
      error: err.message 
    });
  }
});

// ✅ 테이블 존재 여부 확인 API
router.post("/check-tables", async (req, res) => {
  const { businessLocation, department } = req.body;
  
  if (!businessLocation || !department) {
    return res.status(400).json({ 
      success: false,
      message: "사업소와 부서를 선택해주세요!" 
    });
  }

  const inputTable = `${businessLocation}_${department}_input`;
  const outputTable = `${businessLocation}_${department}_output`;
  const productTable = `${businessLocation}_${department}_product`;

  try {
    const inputExists = await checkTableExists(inputTable);
    const outputExists = await checkTableExists(outputTable);
    const productExists = await checkTableExists(productTable);

    res.status(200).json({ 
      success: true,
      exists: inputExists && outputExists && productExists,
      tables: {
        input: inputExists,
        output: outputExists,
        product: productExists
      },
      tableNames: {
        input: inputTable,
        output: outputTable,
        product: productTable
      }
    });
  } catch (err) {
    console.error("❌ 테이블 확인 오류:", err);
    res.status(500).json({ 
      success: false,
      message: "테이블 확인 중 오류가 발생했습니다.",
      error: err.message 
    });
  }
});

// 데이터 조회 API (테스트용)
router.get("/", (req, res) => {
  res.status(200).json({ message: "Data retrieved successfully!" });
});

module.exports = router;