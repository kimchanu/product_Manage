const db = require("../db");

const LOCATION_NAME_BY_CODE = {
  GK: "GK사업소",
  CM: "천마사업소",
  ES: "을숙도사업소",
  KN: "강남사업소",
  SW: "수원사업소",
};

const LOCATION_CODE_BY_NAME = Object.entries(LOCATION_NAME_BY_CODE).reduce(
  (acc, [code, name]) => {
    acc[name] = code;
    return acc;
  },
  {}
);

const normalizeBusinessLocation = (value) => {
  if (!value) return "";
  return LOCATION_CODE_BY_NAME[value] || value;
};

const getBusinessLocationVariants = (value) => {
  const normalized = normalizeBusinessLocation(value);
  const name = LOCATION_NAME_BY_CODE[normalized];
  return name ? [normalized, name] : [normalized];
};

const ensureApprovalTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS statement_approval_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      business_location VARCHAR(50) NOT NULL,
      department VARCHAR(50) NOT NULL,
      approver_user_id INT NOT NULL,
      approver_name VARCHAR(100) NOT NULL,
      approver_position VARCHAR(50) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_statement_approval_settings (business_location, department)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS statement_approval_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      business_location VARCHAR(50) NOT NULL,
      department VARCHAR(50) NOT NULL,
      report_year INT NOT NULL,
      report_month INT NOT NULL,
      requester_user_id INT NOT NULL,
      requester_name VARCHAR(100) NOT NULL,
      approver_user_id INT NOT NULL,
      approver_name VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'submitted',
      submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME NULL,
      approved_by_user_id INT NULL,
      approved_by_name VARCHAR(100) NULL,
      rejection_reason TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_statement_approval_documents (business_location, department, report_year, report_month),
      KEY idx_statement_approval_status (business_location, approver_user_id, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

const getApprovalSetting = async ({ businessLocation, department }) => {
  await ensureApprovalTables();
  const normalizedLocation = normalizeBusinessLocation(businessLocation);
  const [rows] = await db.query(
    `
      SELECT *
      FROM statement_approval_settings
      WHERE business_location = ? AND department = ?
      LIMIT 1
    `,
    [normalizedLocation, department]
  );
  return rows[0] || null;
};

const getApprovalDocument = async ({ businessLocation, department, year, month }) => {
  await ensureApprovalTables();
  const normalizedLocation = normalizeBusinessLocation(businessLocation);
  const [rows] = await db.query(
    `
      SELECT *
      FROM statement_approval_documents
      WHERE business_location = ? AND department = ? AND report_year = ? AND report_month = ?
      LIMIT 1
    `,
    [normalizedLocation, department, year, month]
  );
  return rows[0] || null;
};

const getLatestApprovedDocument = async ({ businessLocation, department }) => {
  await ensureApprovalTables();
  const normalizedLocation = normalizeBusinessLocation(businessLocation);
  const [rows] = await db.query(
    `
      SELECT *
      FROM statement_approval_documents
      WHERE business_location = ? AND department = ? AND status = 'approved'
      ORDER BY report_year DESC, report_month DESC
      LIMIT 1
    `,
    [normalizedLocation, department]
  );
  return rows[0] || null;
};

const getPeriodEndDate = (year, month) => {
  return new Date(year, month, 0, 23, 59, 59, 999);
};

const assertPeriodUnlocked = async ({ businessLocation, department, date, actionLabel = "처리" }) => {
  if (!date || !businessLocation || !department) return;

  const latestApproved = await getLatestApprovedDocument({ businessLocation, department });
  if (!latestApproved) return;

  const targetDate = new Date(date);
  if (Number.isNaN(targetDate.getTime())) return;

  const lockedUntil = getPeriodEndDate(latestApproved.report_year, latestApproved.report_month);
  if (targetDate <= lockedUntil) {
    const lockLabel = `${latestApproved.report_year}년 ${String(latestApproved.report_month).padStart(2, "0")}월`;
    throw new Error(`${lockLabel} 결재가 완료되어 해당 월 포함 이전 입출고 데이터는 ${actionLabel}할 수 없습니다.`);
  }
};

module.exports = {
  LOCATION_NAME_BY_CODE,
  ensureApprovalTables,
  normalizeBusinessLocation,
  getBusinessLocationVariants,
  getApprovalSetting,
  getApprovalDocument,
  getLatestApprovedDocument,
  assertPeriodUnlocked,
};
