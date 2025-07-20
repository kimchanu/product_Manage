const express = require("express");
const router = express.Router();
const { createModels } = require("../models/material");
const createOutputModel = require("../models/OutputModel");
const sequelize = require("../db/sequelize");

// 출고 저장 API
router.post("/", async (req, res) => {
  const { materials, comment, date, department, business_location, user_id } = req.body;
  console.log(req.body);
  if (!Array.isArray(materials) || materials.length === 0) {
    return res.status(400).json({ message: "출고 자재 목록이 비어있습니다." });
  }
  if (!comment || !date || !department || !business_location || !user_id) {
    return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
  }

  const { Product, Input, Output } = createModels(business_location, department);

  const transaction = await Input.sequelize.transaction();

  try {
    for (const mat of materials) {
      const { material_id, outputQty } = mat;

      // 입력 수량 확인
      const totalInput = await Input.sum("quantity", { where: { material_id } });
      const totalOutput = await Output.sum("quantity", { where: { material_id } });
      const stock = (totalInput || 0) - (totalOutput || 0);

      if (outputQty > stock) {
        throw new Error(`자재 ID ${material_id}의 재고 부족. 현재 재고: ${stock}, 요청 수량: ${outputQty}`);
      }

      // 출고 등록
      await Output.create(
        {
          material_id,
          quantity: outputQty,
          comment,
          date: date, // ✅ DATETIME 포맷
          department,
          business_location,
          user_id,
        },
        { transaction }
      );
    }

    console.log(`출고자: ${user_id}, 부서: ${department}, 장소: ${business_location}`);
    console.log(`출고일: ${date}, 코멘트: ${comment}`);

    await transaction.commit();
    return res.status(200).json({ message: "출고가 성공적으로 저장되었습니다." });
  } catch (error) {
    console.error("출고 저장 실패:", error);
    await transaction.rollback();
    return res.status(500).json({ message: "출고 저장 중 오류가 발생했습니다.", error: error.message });
  }
});

// 출고 수정 API
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    output_date,
    user_id,
    comment,
    output_quantity,
    department, business_location,
  } = req.body;

  console.log('Received update request for id:', id);
  console.log('Update data:', req.body);

  if (!output_date || !user_id) {
    return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
  }

  let transaction;
  try {
    // 먼저 해당 출고 기록을 찾아서 business_location과 department 정보를 가져옵니다
    const Output = createOutputModel(business_location, department); // Default values for initial lookup
    transaction = await sequelize.transaction();

    const output = await Output.findOne({
      where: { id },
      transaction
    });

    if (!output) {
      await transaction.rollback();
      return res.status(404).json({ message: "해당 출고 기록을 찾을 수 없습니다." });
    }

    const { business_location, department } = output;
    const OutputModel = createOutputModel(business_location, department);

    console.log('Updating output record:', {
      id,
      business_location,
      department,
      updateData: {
        date: output_date,
        user_id,
        comment: comment || null,
        quantity: output_quantity || output.quantity
      }
    });

    // 출고 정보 수정
    const [outputUpdateCount] = await OutputModel.update(
      {
        date: output_date,
        user_id,
        comment: comment || null,
        quantity: output_quantity || output.quantity
      },
      {
        where: { id },
        transaction
      }
    );

    if (outputUpdateCount === 0) {
      throw new Error('출고 정보 업데이트 실패');
    }

    await transaction.commit();
    console.log('Update completed successfully for id:', id);
    res.json({ message: "출고 정보가 성공적으로 수정되었습니다." });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("출고 수정 실패:", error);
    res.status(500).json({ message: error.message || "출고 수정 중 오류가 발생했습니다." });
  }
});

// 출고 삭제 API
router.delete("/:material_id/:id", async (req, res) => {
  const { material_id, id } = req.params;
  const { business_location, department } = req.body;

  if (!business_location || !department) {
    return res.status(400).json({ message: "사업소와 부서 정보가 필요합니다." });
  }

  try {
    // 먼저 해당 출고 기록을 찾아서 business_location과 department 정보를 가져옵니다
    const Output = createOutputModel(business_location, department);
    const output = await Output.findOne({
      where: { material_id, id }
    });

    if (!output) {
      return res.status(404).json({ message: "해당 출고 기록을 찾을 수 없습니다." });
    }

    const { business_location, department } = output;
    const OutputModel = createOutputModel(business_location, department);

    // 출고 기록 삭제
    await OutputModel.destroy({
      where: { material_id, id },
    });

    return res.status(200).json({ message: "출고 기록이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("출고 삭제 실패:", error);
    return res.status(500).json({ message: "출고 삭제 중 오류가 발생했습니다.", error: error.message });
  }
});

module.exports = router;