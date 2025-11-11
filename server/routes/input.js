const express = require("express");
const router = express.Router();
const { createModels } = require("../models/material");
const createInputModel = require("../models/InputModel");
const sequelize = require("../db/sequelize");
const authMiddleware = require("../middleware/authMiddleware");

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

// 수동 입고 저장 API
router.post("/manual", authMiddleware, async (req, res) => {
    const { items, type } = req.body;
    console.log("수동 입고 요청:", req.body);
    
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: "입고 자재 목록이 비어있습니다." 
        });
    }

    if (type !== 'manual_input') {
        return res.status(400).json({ 
            success: false, 
            message: "잘못된 요청 타입입니다." 
        });
    }

    // JWT 토큰에서 사용자 정보 가져오기
    const user = req.user;
    
    // 기본값 설정
    const { department = "ITS", business_location } = req.body;
    
    // 사업소명을 코드로 변환 (요청에서 받은 사업소가 있으면 사용, 없으면 JWT에서 가져옴)
    let business_location_code = "";
    if (business_location) {
        business_location_code = business_location; // 이미 코드로 전달됨
    } else {
        // JWT에서 사업소명을 코드로 변환
        switch (user.business_location) {
            case "GK사업소":
                business_location_code = "GK";
                break;
            case "천마사업소":
                business_location_code = "CM";
                break;
            case "을숙도사업소":
                business_location_code = "ES";
                break;
            default:
                business_location_code = user.business_location;
        }
    }

    const defaultValues = {
        comment: "수동 입력",
        date: new Date().toISOString().split('T')[0],
        department: department,
        business_location: business_location_code,
        user_id: user.id
    };

    const { Product, Input, Output } = createModels(defaultValues.business_location, defaultValues.department);
    const transaction = await Input.sequelize.transaction();

    try {
        const savedItems = [];
        
        for (const item of items) {
            const { 자재코드, 품명, 규격, 단위, 단가, 입고수량 } = item;
            
            // 자재코드가 없으면 건너뛰기
            if (!자재코드 || !입고수량) {
                console.warn("필수 정보가 누락된 항목:", item);
                continue;
            }

            // 자재 정보를 Product 테이블에 먼저 저장하거나 업데이트
            let product = await Product.findOne({
                where: { material_id: 자재코드 },
                transaction
            });

            if (!product) {
                // 새 자재 등록
                product = await Product.create({
                    material_id: 자재코드,
                    name: 품명 || '',
                    specification: 규격 || '',
                    unit: 단위 || '',
                    price: Number(단가) || 0,
                    input_quantity: Number(입고수량) || 0,
                    output_quantity: 0,
                    appropriate_quantity: 0
                }, { transaction });
            } else {
                // 기존 자재 정보 업데이트
                await product.update({
                    name: 품명 || product.name,
                    specification: 규격 || product.specification,
                    unit: 단위 || product.unit,
                    price: Number(단가) || product.price,
                    input_quantity: (Number(product.input_quantity) || 0) + (Number(입고수량) || 0)
                }, { transaction });
            }

            // 입고 기록 저장
            const inputRecord = await Input.create({
                material_id: 자재코드,
                quantity: Number(입고수량) || 0,
                comment: defaultValues.comment,
                date: defaultValues.date,
                department: defaultValues.department,
                business_location: defaultValues.business_location,
                user_id: defaultValues.user_id,
            }, { transaction });

            savedItems.push({
                자재코드,
                품명,
                입고수량: Number(입고수량),
                inputId: inputRecord.id
            });
        }

        await transaction.commit();
        
        console.log(`수동 입고 완료: ${savedItems.length}개 항목`);
        return res.status(200).json({ 
            success: true, 
            message: `${savedItems.length}개의 자재가 성공적으로 입고되었습니다.`,
            savedItems
        });
    } catch (error) {
        console.error("수동 입고 저장 실패:", error);
        await transaction.rollback();
        return res.status(500).json({ 
            success: false, 
            message: "수동 입고 저장 중 오류가 발생했습니다.", 
            error: error.message 
        });
    }
});

module.exports = router;