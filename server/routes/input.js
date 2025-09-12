const express = require("express");
const router = express.Router();
const { createModels } = require("../models/material");
const createInputModel = require("../models/InputModel");
const sequelize = require("../db/sequelize");

// 입고 저장 API
router.post("/", async (req, res) => {
    const { materials, comment, date, department, business_location, user_id } = req.body;
    console.log(req.body);
    if (!Array.isArray(materials) || materials.length === 0) {
        return res.status(400).json({ message: "입고 자재 목록이 비어있습니다." });
    }
    if (!comment || !date || !department || !business_location || !user_id) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
    }

    const { Product, Input, Output } = createModels(business_location, department);
    const transaction = await Input.sequelize.transaction();

    try {
        for (const mat of materials) {
            const { material_id, inputQty } = mat;

            // 입고 등록
            await Input.create(
                {
                    material_id,
                    quantity: inputQty,
                    comment,
                    date: date,
                    department,
                    business_location,
                    user_id,
                },
                { transaction }
            );
        }

        console.log(`입고자: ${user_id}, 부서: ${department}, 장소: ${business_location}`);
        console.log(`입고일: ${date}, 코멘트: ${comment}`);

        await transaction.commit();
        return res.status(200).json({ message: "입고가 성공적으로 저장되었습니다." });
    } catch (error) {
        console.error("입고 저장 실패:", error);
        await transaction.rollback();
        return res.status(500).json({ message: "입고 저장 중 오류가 발생했습니다.", error: error.message });
    }
});

// 입고 수정 API
router.put("/:material_id/:id", async (req, res) => {
    const { material_id, id } = req.params;
    const {
        input_date,
        user_id,
        comment,
        input_quantity,
        business_location,
        department
    } = req.body;

    console.log('Received update request for id:', id);
    console.log('Update data:', req.body);

    if (!input_date || !user_id) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
    }

    let transaction;
    try {
        const Input = createInputModel(business_location, department);
        transaction = await sequelize.transaction();

        const input = await Input.findOne({
            where: { id },
            transaction
        });

        if (!input) {
            await transaction.rollback();
            return res.status(404).json({ message: "해당 입고 기록을 찾을 수 없습니다." });
        }


        const InputModel = createInputModel(business_location, department);

        console.log('Updating input record:', {
            id,
            business_location,
            department,
            updateData: {
                date: input_date,
                user_id,
                comment: comment || null,
                quantity: input_quantity || input.quantity
            }
        });

        const [inputUpdateCount] = await InputModel.update(
            {
                date: input_date,
                user_id,
                comment: comment || null,
                quantity: input_quantity || input.quantity
            },
            {
                where: { id },
                transaction
            }
        );

        if (inputUpdateCount === 0) {
            throw new Error('입고 정보 업데이트 실패');
        }

        await transaction.commit();
        console.log('Update completed successfully for id:', id);
        res.json({ message: "입고 정보가 성공적으로 수정되었습니다." });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("입고 수정 실패:", error);
        res.status(500).json({ message: error.message || "입고 수정 중 오류가 발생했습니다." });
    }
});

// 입고 삭제 API
router.delete("/:material_id/:id", async (req, res) => {
    const { material_id, id } = req.params;
    const { department, business_location } = req.body;

    let transaction;
    try {
        const Input = createInputModel(business_location, department);
        transaction = await sequelize.transaction();

        const input = await Input.findOne({
            where: { material_id, id },
            transaction
        });

        if (!input) {
            await transaction.rollback();
            return res.status(404).json({ message: "해당 입고 기록을 찾을 수 없습니다." });
        }

        await Input.destroy({
            where: { material_id, id },
            transaction
        });

        await transaction.commit();

        return res.status(200).json({ message: "입고 기록이 성공적으로 삭제되었습니다." });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("입고 삭제 실패:", error);
        return res.status(500).json({ message: "입고 삭제 중 오류가 발생했습니다.", error: error.message });
    }
});

module.exports = router;