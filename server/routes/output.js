const express = require("express");
const router = express.Router();
const { createModels, ApiMainProduct } = require("../models/material");
const createOutputModel = require("../models/OutputModel");
const sequelize = require("../db/sequelize");

// 출고 저장 API
router.post("/", async (req, res) => {
  const { materials, comment, date, department, business_location, user_id } = req.body;
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
      // 1. Local Input Sum
      const localInputSum = await Input.sum("quantity", { where: { material_id } });

      // 2. ApiMainProduct Sum (Groupware Initial Stock)
      const locationMapping = {
        "GK": "GK사업소"
      };
      const gwBusinessLocation = locationMapping[business_location] || business_location;

      const gwInputSum = await ApiMainProduct.sum("quantity", {
        where: {
          material_id,
          business_location: gwBusinessLocation,
          department
        }
      });

      const totalInput = (localInputSum || 0) + (gwInputSum || 0);

      const totalOutput = await Output.sum("quantity", { where: { material_id } });
      const stock = totalInput - (totalOutput || 0);

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

    await transaction.commit();
    return res.status(200).json({ message: "출고가 성공적으로 저장되었습니다." });
  } catch (error) {
    console.error("출고 저장 실패:", error);
    await transaction.rollback();
    return res.status(500).json({ message: "출고 저장 중 오류가 발생했습니다.", error: error.message });
  }
});

// 출고 수정 API
router.put("/:material_id/:id", async (req, res) => {
  const { material_id, id } = req.params;
  const {
    output_date,
    user_id,
    comment,
    output_quantity,
    department, business_location,
  } = req.body;

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

    const outputBusinessLocation = output.business_location;
    const outputDepartment = output.department;
    const OutputModel = createOutputModel(outputBusinessLocation, outputDepartment);

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
      // Don't throw for idempotent updates
    }

    await transaction.commit();
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

    const outputBusinessLocation = output.business_location;
    const outputDepartment = output.department;
    const OutputModel = createOutputModel(outputBusinessLocation, outputDepartment);

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

// 출고 기록 분할 API
router.post("/split/:material_id/:id", async (req, res) => {
  const { material_id, id } = req.params;
  const { splits, business_location, department } = req.body;

  if (!business_location || !department) {
    return res.status(400).json({ message: "사업소와 부서 정보가 필요합니다." });
  }

  if (!Array.isArray(splits) || splits.length === 0) {
    return res.status(400).json({ message: "분할 데이터가 올바르지 않습니다." });
  }

  // 분할 데이터 검증
  for (const split of splits) {
    if (!split.quantity || !split.date) {
      return res.status(400).json({ message: "분할 데이터에 수량 또는 날짜가 누락되었습니다." });
    }
    if (split.quantity <= 0) {
      return res.status(400).json({ message: "수량은 0보다 커야 합니다." });
    }
  }

  let transaction;
  try {
    // 1. 기존 출고 기록 조회
    const Output = createOutputModel(business_location, department);
    const originalOutput = await Output.findOne({
      where: { material_id, id }
    });

    if (!originalOutput) {
      return res.status(404).json({ message: "해당 출고 기록을 찾을 수 없습니다." });
    }

    // 2. 분할된 수량의 합이 원래 수량과 일치하는지 확인
    const totalSplitQuantity = splits.reduce((sum, split) => sum + split.quantity, 0);
    if (totalSplitQuantity !== originalOutput.quantity) {
      return res.status(400).json({
        message: `분할된 수량의 합(${totalSplitQuantity})이 원래 수량(${originalOutput.quantity})과 일치하지 않습니다.`
      });
    }

    // 3. 재고 확인
    const { Product, Input, Output: OutputModel } = createModels(business_location, department);

    // 3-1. Local Input Check
    const localInputSum = await Input.sum("quantity", { where: { material_id } });

    // 3-2. ApiMainProduct Logic
    const locationMapping = {
      "GK": "GK사업소"
    };
    const gwBusinessLocation = locationMapping[business_location] || business_location;

    const gwInputSum = await ApiMainProduct.sum("quantity", {
      where: {
        material_id,
        business_location: gwBusinessLocation,
        department
      }
    });

    const totalInput = (localInputSum || 0) + (gwInputSum || 0);
    const totalOutput = await OutputModel.sum("quantity", { where: { material_id } });
    const stock = totalInput - (totalOutput || 0) + originalOutput.quantity; // 기존 출고 기록을 제외한 재고

    if (totalSplitQuantity > stock) {
      return res.status(400).json({
        message: `재고 부족. 현재 재고: ${stock}, 요청 수량: ${totalSplitQuantity}`
      });
    }

    transaction = await sequelize.transaction();

    // 4. 기존 출고 기록 삭제
    await OutputModel.destroy({
      where: { material_id, id },
      transaction
    });

    // 5. 새로운 출고 기록들 추가
    const newOutputs = [];
    for (const split of splits) {
      const newOutput = await OutputModel.create({
        material_id,
        quantity: split.quantity,
        date: split.date,
        comment: originalOutput.comment,
        department: originalOutput.department,
        business_location: originalOutput.business_location,
        user_id: originalOutput.user_id,
      }, { transaction });

      newOutputs.push(newOutput);
    }

    await transaction.commit();

    return res.status(200).json({
      message: "출고 기록이 성공적으로 분할되었습니다.",
      originalQuantity: originalOutput.quantity,
      splitCount: splits.length,
      splits: splits
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("출고 기록 분할 실패:", error);
    return res.status(500).json({
      message: "출고 기록 분할 중 오류가 발생했습니다.",
      error: error.message
    });
  }
});

// 일괄 수정 API
router.put("/batch-update", async (req, res) => {
  const { updates, business_location, department } = req.body;

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "수정할 데이터가 없습니다." });
  }

  if (!business_location || !department) {
    return res.status(400).json({ message: "사업소와 부서 정보가 누락되었습니다." });
  }

  let transaction;
  try {
    const OutputModel = createOutputModel(business_location, department);
    transaction = await sequelize.transaction();

    for (const update of updates) {
      const { id, output_date, user_id, comment, quantity } = update;

      await OutputModel.update(
        {
          date: output_date,
          user_id,
          comment: comment || null,
          quantity: quantity
        },
        {
          where: { id },
          transaction
        }
      );
    }

    await transaction.commit();
    res.json({ message: "일괄 수정이 완료되었습니다." });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("일괄 수정 실패:", error);
    res.status(500).json({ message: "일괄 수정 중 오류가 발생했습니다.", error: error.message });
  }
});

module.exports = router;