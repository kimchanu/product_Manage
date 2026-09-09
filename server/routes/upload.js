const express = require("express");
const router = express.Router();
const db = require("../db");
const { assertPeriodUnlocked } = require("../services/statementApprovalService");

const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    return Number(trimmed.replace(/,/g, "")) || 0;
  }
  return Number(value) || 0;
};

const escapeIdentifier = (name) => `\`${String(name).replace(/`/g, "``")}\``;

const toMysqlDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day} 00:00:00`;
};

const getMonthEndDate = (year, monthIndex) => {
  return toMysqlDateTime(new Date(year, monthIndex + 1, 0));
};

router.post("/", async (req, res) => {
  const dataSize = Buffer.byteLength(JSON.stringify(req.body), "utf8") / (1024 * 1024);
  console.log(`업로드 데이터 크기: ${dataSize.toFixed(2)}MB`);

  const { businessLocation, department, username, selectedYear, csvData } = req.body;
  const importYear = Number(selectedYear);

  if (!businessLocation || !department || !username || !Array.isArray(csvData) || csvData.length === 0) {
    return res.status(400).json({ message: "사업소, 부서, 사용자, 업로드 데이터가 모두 필요합니다." });
  }

  if (!Number.isInteger(importYear) || importYear < 2000 || importYear > 2100) {
    return res.status(400).json({ message: "유효한 기준 연도를 선택해주세요." });
  }

  const inputTable = `${businessLocation}_${department}_input`;
  const outputTable = `${businessLocation}_${department}_output`;
  const productTable = `${businessLocation}_${department}_product`;

  try {
    const carryoverDate = new Date(importYear - 1, 11, 31);
    await assertPeriodUnlocked({
      businessLocation,
      department,
      date: carryoverDate,
      actionLabel: "등록",
    });

    const tableExists = await checkTableExists(inputTable);
    if (tableExists) {
      return res.status(400).json({ message: "이미 등록되었습니다. 저장이 안되었습니다!" });
    }

    await createTables(inputTable, outputTable, productTable);

    const summary = await insertDataWithTransaction(
      inputTable,
      outputTable,
      productTable,
      businessLocation,
      department,
      username,
      csvData,
      importYear
    );

    res.status(200).json({ message: `${importYear}년 자재 데이터가 저장되었습니다.`, summary });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message || "Server error!" });
  }
});

async function checkTableExists(tableName) {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
      [tableName]
    );
    return rows[0].count > 0;
  } catch (err) {
    console.error("Table existence check failed:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function createTables(inputTable, outputTable, productTable) {
  const inputTableName = escapeIdentifier(inputTable);
  const outputTableName = escapeIdentifier(outputTable);
  const productTableName = escapeIdentifier(productTable);

  const createInputTable = `
    CREATE TABLE IF NOT EXISTS ${inputTableName} (
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
    CREATE TABLE IF NOT EXISTS ${outputTableName} (
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
    CREATE TABLE IF NOT EXISTS ${productTableName} (
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

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(createInputTable);
    await connection.query(createOutputTable);
    await connection.query(createProductTable);
    await connection.commit();
    console.log("Tables created successfully");
  } catch (err) {
    await connection.rollback();
    console.error("Table creation failed, rolling back:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function insertRowsInChunks(connection, tableName, columns, rows) {
  if (rows.length === 0) return;

  const tableSql = escapeIdentifier(tableName);
  const columnSql = columns.map(escapeIdentifier).join(", ");
  const batchSize = 1000;

  for (let index = 0; index < rows.length; index += batchSize) {
    const chunk = rows.slice(index, index + batchSize);
    await connection.query(`INSERT INTO ${tableSql} (${columnSql}) VALUES ?`, [chunk]);
  }
}

async function insertDataWithTransaction(inputTable, outputTable, productTable, businessLocation, department, username, csvData, selectedYear) {
  const connection = await db.getConnection();
  const carryoverDate = `${selectedYear - 1}-12-31 00:00:00`;

  try {
    await connection.beginTransaction();

    const productRows = [];
    const inputRows = [];
    const outputRows = [];

    csvData.forEach((item) => {
      const materialId = item.id;
      const price = parseNumber(item.단가);

      productRows.push([
        businessLocation,
        department,
        username,
        materialId,
        item.자재코드 || "",
        item.위치 || "",
        item.대분류 || "",
        item.중분류 || "",
        item.소분류 || "",
        item.품명 || "",
        item.규격 || "",
        item.제조사 || "",
        item.거래처 || "",
        item.단위 || "",
        price,
        parseNumber(item.적정수량),
        carryoverDate,
      ]);

      inputRows.push([
        businessLocation,
        department,
        username,
        materialId,
        parseNumber(item.inputCarryover ?? item.입고수량),
        carryoverDate,
        "엑셀 이월 누계",
      ]);

      outputRows.push([
        businessLocation,
        department,
        username,
        materialId,
        parseNumber(item.outputCarryover ?? item.출고수량),
        carryoverDate,
        "엑셀 이월 누계",
      ]);

      const monthlyInputs = Array.isArray(item.monthlyInputs) ? item.monthlyInputs : [];
      const monthlyOutputs = Array.isArray(item.monthlyOutputs) ? item.monthlyOutputs : [];

      for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        const inputQuantity = parseNumber(monthlyInputs[monthIndex]);
        const outputQuantity = parseNumber(monthlyOutputs[monthIndex]);
        const monthDate = getMonthEndDate(selectedYear, monthIndex);
        const comment = `${monthIndex + 1}월 엑셀 업로드`;

        if (inputQuantity !== 0) {
          inputRows.push([businessLocation, department, username, materialId, inputQuantity, monthDate, comment]);
        }

        if (outputQuantity !== 0) {
          outputRows.push([businessLocation, department, username, materialId, outputQuantity, monthDate, comment]);
        }
      }
    });

    await insertRowsInChunks(
      connection,
      productTable,
      ["business_location", "department", "user_id", "material_id", "material_code", "location", "big_category", "category", "sub_category", "name", "specification", "manufacturer", "supplier", "unit", "price", "appropriate", "date"],
      productRows
    );
    await insertRowsInChunks(
      connection,
      inputTable,
      ["business_location", "department", "user_id", "material_id", "quantity", "date", "comment"],
      inputRows
    );
    await insertRowsInChunks(
      connection,
      outputTable,
      ["business_location", "department", "user_id", "material_id", "quantity", "date", "comment"],
      outputRows
    );

    await connection.commit();
    console.log("All data inserted successfully");
    return {
      products: productRows.length,
      inputTransactions: inputRows.length,
      outputTransactions: outputRows.length,
    };
  } catch (err) {
    await connection.rollback();
    console.error("Transaction failed, all inserts rolled back:", err);
    throw err;
  } finally {
    connection.release();
  }
}

router.post("/create-tables", async (req, res) => {
  const { businessLocation, department } = req.body;

  if (!businessLocation || !department) {
    return res.status(400).json({
      success: false,
      message: "사업소와 부서를 선택해주세요!",
    });
  }

  const inputTable = `${businessLocation}_${department}_input`;
  const outputTable = `${businessLocation}_${department}_output`;
  const productTable = `${businessLocation}_${department}_product`;

  try {
    const tableExists = await checkTableExists(inputTable);
    if (tableExists) {
      return res.status(400).json({
        success: false,
        message: `이미 테이블이 존재합니다. (${inputTable})`,
      });
    }

    await createTables(inputTable, outputTable, productTable);

    res.status(200).json({
      success: true,
      message: `테이블이 성공적으로 생성되었습니다. (${inputTable}, ${outputTable}, ${productTable})`,
    });
  } catch (err) {
    console.error("테이블 생성 오류:", err);
    res.status(500).json({
      success: false,
      message: "테이블 생성 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

router.post("/check-tables", async (req, res) => {
  const { businessLocation, department } = req.body;

  if (!businessLocation || !department) {
    return res.status(400).json({
      success: false,
      message: "사업소와 부서를 선택해주세요!",
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
        product: productExists,
      },
      tableNames: {
        input: inputTable,
        output: outputTable,
        product: productTable,
      },
    });
  } catch (err) {
    console.error("테이블 확인 오류:", err);
    res.status(500).json({
      success: false,
      message: "테이블 확인 중 오류가 발생했습니다.",
      error: err.message,
    });
  }
});

router.get("/", (req, res) => {
  res.status(200).json({ message: "Data retrieved successfully!" });
});

module.exports = router;
