const express = require("express");
const router = express.Router();
const { getAllMaterials } = require("../services/materialService");

router.post("/", async (req, res) => {
  const { businessLocation, department } = req.body;

  if (!businessLocation || !department) {
    return res.status(400).json({ error: "사업소와 부서를 모두 입력하세요." });
  }

  try {
    const materials = await getAllMaterials(businessLocation, department);
    res.json(materials);
  } catch (error) {
    console.error("자재 조회 오류:", error);
    res.status(500).json({ error: "자재 정보를 불러오는 중 오류 발생" });
  }
});

module.exports = router;
