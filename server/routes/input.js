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

// 수동 입고 저장 API (테스트용 GET 라우트 추가)
router.get("/manual", (req, res) => {
    res.json({ message: "수동 입고 API 엔드포인트가 정상적으로 등록되었습니다." });
});

// 수동 입고 저장 API
router.post("/manual", authMiddleware, async (req, res) => {
    const { items, type } = req.body;
    console.log("수동 입고 요청:", req.body);
    console.log("요청 URL:", req.originalUrl);
    console.log("요청 메서드:", req.method);
    
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
    const { department = "ITS", business_location, date } = req.body;
    
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
        date: date || new Date().toISOString().split('T')[0], // 요청에서 받은 날짜 사용, 없으면 오늘 날짜
        department: department,
        business_location: business_location_code,
        user_id: user.id
    };

    let transaction;
    try {
        const { Product, Input, Output } = createModels(defaultValues.business_location, defaultValues.department);
        
        // 테이블 존재 여부 확인
        try {
            await Input.describe();
        } catch (tableError) {
            if (tableError.original && tableError.original.code === 'ER_NO_SUCH_TABLE') {
                console.error(`테이블이 존재하지 않습니다: ${defaultValues.business_location}_${defaultValues.department}_input`);
                return res.status(404).json({ 
                    success: false, 
                    message: `해당 사업소(${defaultValues.business_location})와 부서(${defaultValues.department})의 입고 테이블이 존재하지 않습니다. 관리자에게 문의하세요.`,
                    error: 'TABLE_NOT_FOUND'
                });
            }
            throw tableError;
        }

        transaction = await Input.sequelize.transaction();
        const savedItems = [];
        
        for (const item of items) {
            const { 자재코드, 품명, 규격, 단가, 입고수량 } = item;
            
            // 자재코드와 입고수량이 없으면 건너뛰기
            if (!자재코드 || !입고수량) {
                console.warn("필수 정보가 누락된 항목:", item);
                continue;
            }

            // 항상 새로운 자재 등록 (material_id는 autoIncrement로 자동 생성됨)
            let product;
            let materialId;
            let materialCode = 자재코드;
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
                try {
                    product = await Product.create({
                        material_code: materialCode, // 자재코드(구매번호)를 material_code에 저장
                        name: 품명 || null,
                        specification: 규격 || null,
                        price: Number(단가) || 0,
                        // 나머지 필드들은 NULL로 저장 (location, category, sub_category, manufacturer, supplier, unit, appropriate 등)
                        location: null,
                        category: null,
                        sub_category: null,
                        manufacturer: null,
                        unit: null,
                        appropriate: null,
                        big_category: null
                    }, { transaction });
                    materialId = product.material_id; // 자동 생성된 material_id
                    break; // 성공하면 루프 종료
                } catch (createError) {
                    if (createError.original && createError.original.code === 'ER_NO_SUCH_TABLE') {
                        console.error(`Product 테이블이 존재하지 않습니다: ${defaultValues.business_location}_${defaultValues.department}_product`);
                        await transaction.rollback();
                        return res.status(404).json({ 
                            success: false, 
                            message: `해당 사업소(${defaultValues.business_location})와 부서(${defaultValues.department})의 자재 테이블이 존재하지 않습니다. 관리자에게 문의하세요.`,
                            error: 'TABLE_NOT_FOUND'
                        });
                    }
                    // unique 제약조건 위반 시 material_code에 타임스탬프 추가하여 재시도
                    if (createError.original && (createError.original.code === 'ER_DUP_ENTRY' || createError.name === 'SequelizeUniqueConstraintError')) {
                        retryCount++;
                        if (retryCount < maxRetries) {
                            // material_code에 타임스탬프 추가하여 고유값 생성
                            materialCode = `${자재코드}_${Date.now()}_${retryCount}`;
                            console.warn(`material_code 중복: ${자재코드}, 재시도: ${materialCode}`);
                            continue;
                        } else {
                            throw new Error(`material_code 중복으로 자재 등록 실패: ${자재코드}`);
                        }
                    }
                    throw createError;
                }
            }

            // 입고 기록 저장 (자동 생성된 material_id 사용)
            let inputRecord;
            try {
                inputRecord = await Input.create({
                    material_id: materialId, // 자동 생성된 material_id 사용
                    quantity: Number(입고수량) || 0,
                    comment: defaultValues.comment,
                    date: defaultValues.date,
                    department: defaultValues.department,
                    business_location: defaultValues.business_location,
                    user_id: defaultValues.user_id,
                }, { transaction });
            } catch (inputError) {
                if (inputError.original && inputError.original.code === 'ER_NO_SUCH_TABLE') {
                    console.error(`Input 테이블이 존재하지 않습니다: ${defaultValues.business_location}_${defaultValues.department}_input`);
                    await transaction.rollback();
                    return res.status(404).json({ 
                        success: false, 
                        message: `해당 사업소(${defaultValues.business_location})와 부서(${defaultValues.department})의 입고 테이블이 존재하지 않습니다. 관리자에게 문의하세요.`,
                        error: 'TABLE_NOT_FOUND'
                    });
                }
                throw inputError;
            }

            savedItems.push({
                자재코드,
                품명,
                입고수량: Number(입고수량),
                materialId: materialId,
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
        
        // 테이블이 없는 경우 처리
        if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
            const tableName = error.original.sqlMessage?.match(/`([^`]+)`/)?.[1] || '알 수 없는 테이블';
            console.error(`테이블이 존재하지 않습니다: ${tableName}`);
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(404).json({ 
                success: false, 
                message: `해당 사업소(${defaultValues.business_location})와 부서(${defaultValues.department})의 테이블이 존재하지 않습니다. 관리자에게 문의하세요.`,
                error: 'TABLE_NOT_FOUND',
                tableName: tableName
            });
        }
        
        // 트랜잭션이 있으면 롤백
        if (transaction) {
            await transaction.rollback();
        }
        
        return res.status(500).json({ 
            success: false, 
            message: "수동 입고 저장 중 오류가 발생했습니다.", 
            error: error.message 
        });
    }
});

module.exports = router;