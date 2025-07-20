const express = require("express");
const router = express.Router();
const { updateMaterialField } = require("../services/materialService");

// 일괄 수정 라우트
router.put("/bulk-update", async (req, res) => {
    console.log("bulk-update body:", req.body);
    const { field, value, selectedRows, businessLocation, department } = req.body;
    if (!field || value === undefined || !Array.isArray(selectedRows) || selectedRows.length === 0 || !businessLocation || !department) {
        return res.status(400).json({ error: "필드, 값, 선택 행, 사업소, 부서를 모두 입력하세요." });
    }
    try {
        for (const material_id of selectedRows) {
            await updateMaterialField(material_id, field, value, businessLocation, department);
        }
        res.json({ success: true });
    } catch (error) {
        console.error("일괄 수정 오류:", error);
        res.status(500).json({ error: "일괄 수정 중 오류 발생" });
    }
});

module.exports = router; 