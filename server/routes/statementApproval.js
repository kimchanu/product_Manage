const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const {
  ensureApprovalTables,
  normalizeBusinessLocation,
  getBusinessLocationVariants,
  getApprovalSetting,
  getApprovalDocument,
  getLatestApprovedDocument,
} = require("../services/statementApprovalService");

const router = express.Router();

router.use(authMiddleware);

const parseUserId = (value) => Number(value || 0);

const requireAdmin = (req, res, next) => {
  if (Number(req.user?.admin || 0) < 1) {
    return res.status(403).json({ message: "승인자 지정 권한이 없습니다." });
  }
  next();
};

const getApproverCandidates = async (businessLocation) => {
  const variants = getBusinessLocationVariants(businessLocation);
  const placeholders = variants.map(() => "?").join(", ");
  const [rows] = await db.query(
    `
      SELECT id, full_name, position, business_location, department, COALESCE(is_admin, 0) AS is_admin
      FROM users
      WHERE business_location IN (${placeholders})
        AND (position = '부장' OR COALESCE(is_admin, 0) >= 1)
      ORDER BY COALESCE(is_admin, 0) DESC, position DESC, full_name ASC
    `,
    variants
  );
  return rows;
};

const getPendingDocuments = async ({ user, businessLocation }) => {
  const normalizedLocation = normalizeBusinessLocation(businessLocation);
  const userId = parseUserId(user.user_id);

  if (!userId && Number(user?.admin || 0) < 1) {
    return [];
  }

  if (Number(user?.admin || 0) >= 1) {
    const [rows] = await db.query(
      `
        SELECT *
        FROM statement_approval_documents
        WHERE business_location = ? AND status = 'submitted'
        ORDER BY report_year DESC, report_month DESC, department ASC
        LIMIT 20
      `,
      [normalizedLocation]
    );
    return rows;
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM statement_approval_documents
      WHERE business_location = ?
        AND approver_user_id = ?
        AND status = 'submitted'
      ORDER BY report_year DESC, report_month DESC, department ASC
      LIMIT 20
    `,
    [normalizedLocation, userId]
  );
  return rows;
};

router.get("/meta", async (req, res) => {
  try {
    await ensureApprovalTables();

    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const department = req.query.department || req.user?.department;
    const businessLocation = normalizeBusinessLocation(
      req.query.businessLocation || req.user?.business_location
    );

    if (!year || !month || !department || !businessLocation) {
      return res.status(400).json({ message: "결재 조회에 필요한 정보가 부족합니다." });
    }

    const [setting, document, latestApprovedDocument, approverCandidates, pendingDocuments] =
      await Promise.all([
        getApprovalSetting({ businessLocation, department }),
        getApprovalDocument({ businessLocation, department, year, month }),
        getLatestApprovedDocument({ businessLocation, department }),
        getApproverCandidates(businessLocation),
        getPendingDocuments({ user: req.user, businessLocation }),
      ]);

    const currentUserId = parseUserId(req.user?.user_id);
    const approverUserId = Number(setting?.approver_user_id || document?.approver_user_id || 0);

    res.json({
      setting,
      document,
      latestApprovedDocument,
      approverCandidates,
      pendingDocuments,
      permissions: {
        canAssignApprover: Number(req.user?.admin || 0) >= 1,
        canSubmit: req.user?.department === department,
        canApprove:
          currentUserId > 0 && approverUserId > 0 && currentUserId === approverUserId,
      },
    });
  } catch (error) {
    console.error("Statement approval meta error:", error);
    res.status(500).json({ message: "전자결재 정보를 불러오지 못했습니다." });
  }
});

router.put("/approver", requireAdmin, async (req, res) => {
  try {
    await ensureApprovalTables();

    const businessLocation = normalizeBusinessLocation(req.body.businessLocation);
    const department = req.body.department;
    const approverUserId = Number(req.body.approverUserId);

    if (!businessLocation || !department || !approverUserId) {
      return res.status(400).json({ message: "승인자 지정 정보가 올바르지 않습니다." });
    }

    const [users] = await db.query(
      `
        SELECT id, full_name, position
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [approverUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "지정할 승인자를 찾을 수 없습니다." });
    }

    const approver = users[0];
    await db.query(
      `
        INSERT INTO statement_approval_settings (
          business_location, department, approver_user_id, approver_name, approver_position
        )
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          approver_user_id = VALUES(approver_user_id),
          approver_name = VALUES(approver_name),
          approver_position = VALUES(approver_position)
      `,
      [businessLocation, department, approver.id, approver.full_name, approver.position || null]
    );

    res.json({ message: "승인자가 저장되었습니다." });
  } catch (error) {
    console.error("Statement approver update error:", error);
    res.status(500).json({ message: "승인자를 저장하지 못했습니다." });
  }
});

router.get("/settings", requireAdmin, async (req, res) => {
  try {
    await ensureApprovalTables();

    const businessLocation = normalizeBusinessLocation(req.query.businessLocation || "");
    const params = [];
    let whereClause = "";

    if (businessLocation) {
      whereClause = "WHERE s.business_location = ?";
      params.push(businessLocation);
    }

    const [settings] = await db.query(
      `
        SELECT
          s.business_location,
          s.department,
          s.approver_user_id,
          s.approver_name,
          s.approver_position,
          s.updated_at
        FROM statement_approval_settings s
        ${whereClause}
        ORDER BY s.business_location ASC, FIELD(s.department, 'ITS', '시설', '기전'), s.department ASC
      `,
      params
    );

    res.json({ settings });
  } catch (error) {
    console.error("Statement approval settings error:", error);
    res.status(500).json({ message: "승인자 설정 목록을 불러오지 못했습니다." });
  }
});

router.get("/approver-candidates", requireAdmin, async (req, res) => {
  try {
    await ensureApprovalTables();

    const businessLocation = normalizeBusinessLocation(req.query.businessLocation);
    if (!businessLocation) {
      return res.status(400).json({ message: "사업소 정보가 필요합니다." });
    }

    const approverCandidates = await getApproverCandidates(businessLocation);
    res.json({ approverCandidates });
  } catch (error) {
    console.error("Statement approval candidates error:", error);
    res.status(500).json({ message: "승인자 후보를 불러오지 못했습니다." });
  }
});

router.post("/submit", async (req, res) => {
  try {
    await ensureApprovalTables();

    const year = Number(req.body.year);
    const month = Number(req.body.month);
    const department = req.body.department || req.user?.department;
    const businessLocation = normalizeBusinessLocation(
      req.body.businessLocation || req.user?.business_location
    );

    if (!year || !month || !department || !businessLocation) {
      return res.status(400).json({ message: "상신 정보가 올바르지 않습니다." });
    }

    if (req.user?.department !== department && Number(req.user?.admin || 0) < 1) {
      return res.status(403).json({ message: "다른 부서 보고서를 상신할 수 없습니다." });
    }

    const setting = await getApprovalSetting({ businessLocation, department });
    if (!setting) {
      return res.status(400).json({ message: "먼저 해당 부서의 승인자를 지정해 주세요." });
    }

    const existing = await getApprovalDocument({ businessLocation, department, year, month });
    if (existing?.status === "approved") {
      return res.status(409).json({ message: "이미 결재 완료된 보고서입니다." });
    }

    await db.query(
      `
        INSERT INTO statement_approval_documents (
          business_location,
          department,
          report_year,
          report_month,
          requester_user_id,
          requester_name,
          approver_user_id,
          approver_name,
          status,
          submitted_at,
          approved_at,
          approved_by_user_id,
          approved_by_name,
          rejection_reason
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', NOW(), NULL, NULL, NULL, NULL)
        ON DUPLICATE KEY UPDATE
          requester_user_id = VALUES(requester_user_id),
          requester_name = VALUES(requester_name),
          approver_user_id = VALUES(approver_user_id),
          approver_name = VALUES(approver_name),
          status = 'submitted',
          submitted_at = NOW(),
          approved_at = NULL,
          approved_by_user_id = NULL,
          approved_by_name = NULL,
          rejection_reason = NULL
      `,
      [
        businessLocation,
        department,
        year,
        month,
        parseUserId(req.user?.user_id),
        req.user?.full_name || "작성자",
        Number(setting.approver_user_id),
        setting.approver_name,
      ]
    );

    res.json({ message: "월간보고서가 상신되었습니다." });
  } catch (error) {
    console.error("Statement approval submit error:", error);
    res.status(500).json({ message: "상신 처리에 실패했습니다." });
  }
});

router.post("/approve", async (req, res) => {
  try {
    await ensureApprovalTables();

    const year = Number(req.body.year);
    const month = Number(req.body.month);
    const department = req.body.department;
    const businessLocation = normalizeBusinessLocation(req.body.businessLocation);

    if (!year || !month || !department || !businessLocation) {
      return res.status(400).json({ message: "결재 정보가 올바르지 않습니다." });
    }

    const document = await getApprovalDocument({ businessLocation, department, year, month });
    if (!document) {
      return res.status(404).json({ message: "상신된 보고서를 찾을 수 없습니다." });
    }

    const currentUserId = parseUserId(req.user?.user_id);
    const canApprove =
      currentUserId > 0 && currentUserId === Number(document.approver_user_id);

    if (!canApprove) {
      return res.status(403).json({ message: "결재 권한이 없습니다." });
    }

    if (document.status === "approved") {
      return res.status(409).json({ message: "이미 결재 완료된 보고서입니다." });
    }

    await db.query(
      `
        UPDATE statement_approval_documents
        SET
          status = 'approved',
          approved_at = NOW(),
          approved_by_user_id = ?,
          approved_by_name = ?,
          rejection_reason = NULL
        WHERE business_location = ? AND department = ? AND report_year = ? AND report_month = ?
      `,
      [
        currentUserId,
        req.user?.full_name || "결재자",
        businessLocation,
        department,
        year,
        month,
      ]
    );

    res.json({ message: "결재가 완료되었습니다. 해당 월 포함 이전 데이터는 잠금 처리됩니다." });
  } catch (error) {
    console.error("Statement approval approve error:", error);
    res.status(500).json({ message: "결재 처리에 실패했습니다." });
  }
});

router.get("/documents", async (req, res) => {
  try {
    await ensureApprovalTables();

    const businessLocation = normalizeBusinessLocation(
      req.query.businessLocation || req.user?.business_location
    );
    const status = String(req.query.status || "all");
    const department = String(req.query.department || "").trim();
    const year = Number(req.query.year || 0);
    const month = Number(req.query.month || 0);
    const currentUserId = parseUserId(req.user?.user_id);
    const isAdmin = Number(req.user?.admin || 0) >= 1;

    if (!businessLocation) {
      return res.status(400).json({ message: "사업소 정보가 필요합니다." });
    }

    const params = [businessLocation];
    let whereClause = `WHERE d.business_location = ?`;

    if (status !== "all") {
      whereClause += ` AND d.status = ?`;
      params.push(status);
    }

    if (department) {
      whereClause += ` AND d.department = ?`;
      params.push(department);
    }

    if (year > 0) {
      whereClause += ` AND d.report_year = ?`;
      params.push(year);
    }

    if (month > 0) {
      whereClause += ` AND d.report_month = ?`;
      params.push(month);
    }

    if (!isAdmin) {
      whereClause += `
        AND (
          d.requester_user_id = ?
          OR d.approver_user_id = ?
          OR d.department = ?
        )
      `;
      params.push(currentUserId, currentUserId, req.user?.department || "");
    }

    const [rows] = await db.query(
      `
        SELECT
          d.*,
          CASE
            WHEN d.approver_user_id = ? THEN 1
            ELSE 0
          END AS can_approve
        FROM statement_approval_documents d
        ${whereClause}
        ORDER BY d.report_year DESC, d.report_month DESC, d.updated_at DESC
        LIMIT 300
      `,
      [currentUserId, ...params]
    );

    res.json({ documents: rows });
  } catch (error) {
    console.error("Statement approval document list error:", error);
    res.status(500).json({ message: "전자결재 문서 목록을 불러오지 못했습니다." });
  }
});

module.exports = router;
