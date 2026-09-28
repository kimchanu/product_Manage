const express = require('express');
const db = require('../db');
const { ensureApprovalTables, getApprovalSetting, getBusinessLocationVariants } = require('../services/statementApprovalService');
const { ensureWorkspaceTables, allowedLocation, validateDraft, validateRecipients, fail } = require('../services/approvalWorkspaceService');
const router = express.Router();

router.use(async (req, res, next) => {
  try {
    if (!Number(req.user?.user_id)) fail(401, '로그인이 필요합니다.');
    await ensureApprovalTables();
    await ensureWorkspaceTables();
    next();
  } catch (error) { next(error); }
});

router.get('/recipients', async (req, res, next) => {
  try {
    const location = allowedLocation(req.user, req.query.businessLocation);
    const [users] = await db.query(
      'SELECT id, full_name, department, position FROM users WHERE business_location IN (?) ORDER BY department, full_name',
      [getBusinessLocationVariants(location)]
    );
    res.json({ users });
  } catch (error) { next(error); }
});

router.get('/drafts', async (req, res, next) => {
  try {
    const location = allowedLocation(req.user, req.query.businessLocation);
    const [rows] = await db.query('SELECT id, payload, updated_at FROM statement_approval_drafts WHERE user_id = ? AND business_location = ? ORDER BY updated_at DESC', [req.user.user_id, location]);
    res.json({ drafts: rows.map((row) => ({ ...JSON.parse(row.payload), id: row.id, updated_at: row.updated_at })) });
  } catch (error) { next(error); }
});

router.post('/drafts', async (req, res, next) => {
  try {
    const draft = validateDraft(req.body, req.user);
    await validateRecipients(db, draft.businessLocation, draft.recipients);
    let id = Number(req.body.id || 0);
    if (id) {
      const [result] = await db.query('UPDATE statement_approval_drafts SET payload = ?, business_location = ? WHERE id = ? AND user_id = ?', [JSON.stringify(draft), draft.businessLocation, id, req.user.user_id]);
      if (!result.affectedRows) fail(404, '임시저장 문서를 찾을 수 없습니다.');
    } else {
      const [result] = await db.query('INSERT INTO statement_approval_drafts (user_id, business_location, payload) VALUES (?, ?, ?)', [req.user.user_id, draft.businessLocation, JSON.stringify(draft)]);
      id = result.insertId;
    }
    res.json({ id, message: '임시저장되었습니다.' });
  } catch (error) { next(error); }
});

router.delete('/drafts/:id', async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM statement_approval_drafts WHERE id = ? AND user_id = ?', [req.params.id, req.user.user_id]);
    if (!result.affectedRows) fail(404, '임시저장 문서를 찾을 수 없습니다.');
    res.json({ message: '임시저장 문서를 삭제했습니다.' });
  } catch (error) { next(error); }
});

router.post('/submit', async (req, res, next) => {
  let connection;
  try {
    const draft = validateDraft(req.body, req.user);
    const setting = await getApprovalSetting(draft);
    if (!setting) fail(400, '관리자 페이지에서 부서 승인자를 먼저 지정해 주세요.');
    connection = await db.getConnection();
    await connection.beginTransaction();
    if (req.body.id) {
      const [owned] = await connection.query('SELECT id FROM statement_approval_drafts WHERE id = ? AND user_id = ? FOR UPDATE', [req.body.id, req.user.user_id]);
      if (!owned.length) fail(404, '임시저장 문서를 찾을 수 없습니다.');
    }
    await validateRecipients(connection, draft.businessLocation, draft.recipients);
    const [existing] = await connection.query(
      'SELECT id FROM statement_approval_documents WHERE business_location = ? AND department = ? AND report_year = ? AND report_month = ? FOR UPDATE',
      [draft.businessLocation, draft.department, draft.year, draft.month]
    );
    if (existing.length) fail(409, '해당 기간에 이미 상신된 문서가 있습니다. 문서함에서 확인해 주세요.');
    const [result] = await connection.query(`INSERT INTO statement_approval_documents
      (business_location, department, report_year, report_month, requester_user_id, requester_name, approver_user_id, approver_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [draft.businessLocation, draft.department, draft.year, draft.month, req.user.user_id, req.user.full_name, setting.approver_user_id, setting.approver_name]);
    await connection.query('INSERT INTO statement_approval_details (document_id, title, content) VALUES (?, ?, ?)', [result.insertId, draft.title, draft.content]);
    if (draft.recipients.length) {
      await connection.query('INSERT INTO statement_approval_circulation (document_id, user_id) VALUES ?', [draft.recipients.map((id) => [result.insertId, id])]);
    }
    if (req.body.id) await connection.query('DELETE FROM statement_approval_drafts WHERE id = ? AND user_id = ?', [req.body.id, req.user.user_id]);
    await connection.commit();
    res.json({ id: result.insertId, message: '문서를 상신했습니다.' });
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') { error.status = 409; error.message = '해당 기간에 이미 상신된 문서가 있습니다.'; }
    next(error);
  } finally { if (connection) connection.release(); }
});

router.get('/documents', async (req, res, next) => {
  try {
    const location = allowedLocation(req.user, req.query.businessLocation);
    const userId = Number(req.user.user_id);
    const isAdmin = Number(req.user.admin || 0) >= 1;
    const [documents] = await db.query(`SELECT d.*, details.title, details.content,
      c.read_at, CASE WHEN c.user_id IS NOT NULL AND d.status = 'approved' THEN 1 ELSE 0 END AS is_circulation,
      CASE WHEN d.approver_user_id = ? AND d.status = 'submitted' THEN 1 ELSE 0 END AS can_approve
      FROM statement_approval_documents d
      LEFT JOIN statement_approval_details details ON details.document_id = d.id
      LEFT JOIN statement_approval_circulation c ON c.document_id = d.id AND c.user_id = ?
      WHERE d.business_location = ? AND
        (? = 1 OR d.requester_user_id = ? OR d.approver_user_id = ? OR d.department = ? OR (c.user_id = ? AND d.status = 'approved'))
      ORDER BY d.updated_at DESC, d.id DESC`,
    [userId, userId, location, isAdmin ? 1 : 0, userId, userId, req.user.department, userId]);
    res.json({ documents });
  } catch (error) { next(error); }
});

router.post('/documents/:id/read', async (req, res, next) => {
  try {
    const [result] = await db.query(`UPDATE statement_approval_circulation c
      INNER JOIN statement_approval_documents d ON d.id = c.document_id
      SET c.read_at = COALESCE(c.read_at, NOW())
      WHERE c.document_id = ? AND c.user_id = ? AND d.status = 'approved'`, [req.params.id, req.user.user_id]);
    if (!result.affectedRows) fail(404, '열람할 회람문서를 찾을 수 없습니다.');
    res.json({ message: '열람 처리되었습니다.' });
  } catch (error) { next(error); }
});

router.use((error, req, res, next) => {
  if (!error.status) console.error('Approval workspace error:', error.message);
  res.status(error.status || 500).json({ message: error.status ? error.message : '전자결재 처리 중 오류가 발생했습니다.' });
});

module.exports = router;
