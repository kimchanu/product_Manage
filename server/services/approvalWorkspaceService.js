const db = require('../db');
const { normalizeBusinessLocation, getBusinessLocationVariants } = require('./statementApprovalService');

let tablesReady;
const ensureWorkspaceTables = () => {
  if (!tablesReady) {
    tablesReady = (async () => {
      await db.query(`CREATE TABLE IF NOT EXISTS statement_approval_drafts (
        id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL,
        business_location VARCHAR(50) NOT NULL, payload MEDIUMTEXT NOT NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_approval_draft_owner (user_id, business_location)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      await db.query(`CREATE TABLE IF NOT EXISTS statement_approval_details (
        document_id INT PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      await db.query(`CREATE TABLE IF NOT EXISTS statement_approval_circulation (
        document_id INT NOT NULL, user_id INT NOT NULL, read_at DATETIME NULL,
        PRIMARY KEY (document_id, user_id), KEY idx_approval_reader (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    })().catch((error) => { tablesReady = null; throw error; });
  }
  return tablesReady;
};

const fail = (status, message) => { const error = new Error(message); error.status = status; throw error; };
const allowedLocation = (user, value) => {
  const location = normalizeBusinessLocation(value || user.business_location);
  if (!location || (Number(user.admin || 0) < 1 && location !== normalizeBusinessLocation(user.business_location))) {
    fail(403, '해당 사업소에 접근할 권한이 없습니다.');
  }
  return location;
};

const validateDraft = (body, user) => {
  const businessLocation = allowedLocation(user, body.businessLocation);
  const department = body.department || user.department;
  if (!['ITS', '시설', '기전'].includes(department)) fail(400, '부서를 선택해 주세요.');
  if (Number(user.admin || 0) < 1 && department !== user.department) fail(403, '본인 부서의 문서만 작성할 수 있습니다.');
  const year = Number(body.year);
  const month = Number(body.month);
  if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
    fail(400, '올바른 보고 기간을 선택해 주세요.');
  }
  const title = String(body.title || '').trim();
  const content = String(body.content || '');
  if (!title || title.length > 255 || content.length > 10000) fail(400, '제목은 255자, 내용은 10,000자 이내로 입력해 주세요.');
  if (!Array.isArray(body.recipients || []) || (body.recipients || []).length > 100) fail(400, '회람자는 최대 100명까지 지정할 수 있습니다.');
  const recipients = [...new Set((body.recipients || []).map(Number))];
  if (recipients.some((id) => !Number.isSafeInteger(id) || id < 1)) fail(400, '회람자 정보가 올바르지 않습니다.');
  return { businessLocation, department, year, month, title, content, recipients };
};

const validateRecipients = async (connection, location, recipients) => {
  if (!recipients.length) return;
  const variants = getBusinessLocationVariants(location);
  const [rows] = await connection.query(
    `SELECT id FROM users WHERE id IN (?) AND business_location IN (?)`, [recipients, variants]
  );
  if (rows.length !== recipients.length) fail(400, '같은 사업소의 사용자만 회람자로 지정할 수 있습니다.');
};

module.exports = { ensureWorkspaceTables, allowedLocation, validateDraft, validateRecipients, fail };
