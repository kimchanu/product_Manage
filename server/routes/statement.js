const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { createModels, ApiMainProduct } = require("../models/material");

router.post("/", async (req, res) => {
    const { businessLocation, department, year, month, budget, categories } = req.body;

    if (!businessLocation || !department || !year || !month || !Array.isArray(categories)) {
        return res.status(400).json({ message: "필수 정보가 누락되었거나 잘못된 형식입니다." });
    }

    try {
        const { Product, Input, Output } = createModels(businessLocation, department);

        const startDate = new Date(year, month - 1, 1); // ex) 5월 1일
        const endDate = new Date(year, month, 0); // ex) 5월 31일
        endDate.setHours(23, 59, 59, 999);

        // 전월 말일 계산 (1월의 경우 전년도 12월 말일)
        let prevEndDate;
        if (month === 1) {
            // 1월의 경우 전년도 12월 31일
            prevEndDate = new Date(year - 1, 11, 31);
        } else {
            // 2월~12월의 경우 전월 말일
            prevEndDate = new Date(year, month - 1, 0);
        }
        prevEndDate.setHours(23, 59, 59, 999);

        // 해당년도 1월부터 12월까지의 총 입고 데이터 조회
        const yearStartDate = new Date(year, 0, 1); // 1월 1일
        const yearEndDate = new Date(year, 11, 31); // 12월 31일
        yearEndDate.setHours(23, 59, 59, 999);

        // 선택된 월까지의 누적 입고 데이터 조회 (1월부터 현재 월까지)
        const cumulativeEndDate = new Date(year, month, 0); // 현재 월 말일
        cumulativeEndDate.setHours(23, 59, 59, 999);

        const includeProduct = {
            model: Product,
            as: "product",
            attributes: ["material_id", "price", "big_category"],
        };

        // 1월인 경우 전년도 12월 데이터도 별도로 조회
        let prevYearInputs = [];
        let prevYearOutputs = [];

        if (month === 1) {
            const prevYear = year - 1;
            const prevYearEndDate = new Date(prevYear, 11, 31);
            prevYearEndDate.setHours(23, 59, 59, 999);

            try {
                [prevYearInputs, prevYearOutputs] = await Promise.all([
                    Input.findAll({
                        where: { date: { [Op.lte]: prevYearEndDate } },
                        attributes: ["material_id", "quantity", "date"],
                        include: [includeProduct],
                    }),
                    Output.findAll({
                        where: { date: { [Op.lte]: prevYearEndDate } },
                        attributes: ["material_id", "quantity", "date"],
                        include: [includeProduct],
                    }),
                ]);
            } catch (error) {
                if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
                    console.warn(`⚠️ 테이블이 존재하지 않음 (${department}), Local 전년도 데이터 없이 진행`);
                } else {
                    throw error;
                }
            }
        }

        // 전월재고 계산: 전월 말일까지의 입고/출고 데이터만 조회
        let prevInputs = [], prevOutputs = [], thisMonthInputs = [], thisMonthOutputs = [], yearTotalInputs = [], cumulativeInputs = [];

        try {
            [prevInputs, prevOutputs, thisMonthInputs, thisMonthOutputs, yearTotalInputs, cumulativeInputs] = await Promise.all([
                Input.findAll({
                    where: {
                        date: {
                            [Op.lte]: prevEndDate
                        }
                    },
                    attributes: ["material_id", "quantity", "date"],
                    include: [includeProduct],
                }),
                Output.findAll({
                    where: {
                        date: {
                            [Op.lte]: prevEndDate
                        }
                    },
                    attributes: ["material_id", "quantity", "date"],
                    include: [includeProduct],
                }),
                Input.findAll({
                    where: { date: { [Op.gte]: startDate, [Op.lte]: endDate } },
                    attributes: ["material_id", "quantity"],
                    include: [includeProduct],
                }),
                Output.findAll({
                    where: { date: { [Op.gte]: startDate, [Op.lte]: endDate } },
                    attributes: ["material_id", "quantity"],
                    include: [includeProduct],
                }),
                Input.findAll({
                    where: { date: { [Op.gte]: yearStartDate, [Op.lte]: yearEndDate } },
                    attributes: ["material_id", "quantity"],
                    include: [includeProduct],
                }),
                Input.findAll({
                    where: { date: { [Op.gte]: yearStartDate, [Op.lte]: cumulativeEndDate } },
                    attributes: ["material_id", "quantity"],
                    include: [includeProduct],
                }),
            ]);
        } catch (error) {
            if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
                console.warn(`⚠️ 테이블이 존재하지 않음 (${department}), Local 데이터 없이 진행`);
                // 빈 배열 유지
            } else {
                throw error;
            }
        }

        const resultByCategory = {};
        const normalizedCategories = categories.map(cat => cat.replace(/\s+/g, '').toUpperCase());
        const categoryMap = {};

        categories.forEach(cat => {
            const upper = cat.replace(/\s+/g, '').toUpperCase();
            if (cat !== "합 계") { // "합 계"는 초기화하지 않음
                resultByCategory[cat] = {
                    prevStock: 0,
                    input: 0,
                    output: 0,
                    remaining: 0,
                };
            }
            categoryMap[upper] = cat;
        });

        // 🔹 ApiMainProduct 데이터 조회 (정적 테이블) - Groupware 초기 데이터
        // 사업소 이름 매핑 (Code -> Name)
        const locationMap = {
            'GK': 'GK사업소',
        };
        const locationName = locationMap[businessLocation] || businessLocation;

        const apiMainProducts = await ApiMainProduct.findAll({
            where: {
                business_location: {
                    [Op.or]: [businessLocation, locationName]
                },
                department: department
            },
            raw: true
        });

        // ApiMainProduct 처리 함수
        const processApiMainProducts = () => {
            apiMainProducts.forEach(item => {
                const itemDate = new Date(item.date);
                const price = item.price || 0;
                const qty = item.quantity || 0;
                const amount = price * qty;

                const rawCategory = item.big_category || "";
                const categoryStr = typeof rawCategory === 'number' ? rawCategory.toString() : rawCategory;
                const upperCategory = categoryStr.replace(/\s+/g, '').toUpperCase();
                const matchedCategory = categoryMap[upperCategory];

                let categoryKey = null;
                if (matchedCategory) {
                    categoryKey = matchedCategory;
                } else if (categoryMap["기타"]) {
                    categoryKey = "기타";
                } else {
                    return;
                }

                if (!resultByCategory[categoryKey]) return;

                // 1. 전월재고 (prevStock): itemDate <= prevEndDate
                if (itemDate <= prevEndDate) {
                    resultByCategory[categoryKey].prevStock += amount;
                }

                // 2. 당월입고 (input): startDate <= itemDate <= endDate
                if (itemDate >= startDate && itemDate <= endDate) {
                    resultByCategory[categoryKey].input += amount;
                }

                // ApiMainProduct는 Output(출고) 데이터는 없음
            });
        };

        processApiMainProducts();

        // 전월재고 계산을 위한 카테고리별 재고 맵
        const prevStockByCategory = {};

        // 음수 재고 원인 분석을 위한 자재별 이력 추적
        const materialHistory = {};

        // 전월재고 계산: 전월 말일까지의 모든 입고/출고 데이터로 계산
        const processPrevStock = (records, type) => {
            records.forEach(item => {
                const product = item.product;
                if (!product) {
                    console.warn(`[prevStock-${type}] product is null for material_id:`, item.material_id);
                    return;
                }

                const materialId = product.material_id;
                const price = product.price ?? 0;
                const qty = item.quantity ?? 0;
                const rawCategory = product.get("big_category") || "";
                // big_category가 숫자인 경우 문자열로 변환
                const categoryStr = typeof rawCategory === 'number' ? rawCategory.toString() : rawCategory;
                const upperCategory = categoryStr.replace(/\s+/g, '').toUpperCase();
                const matchedCategory = categoryMap[upperCategory];

                let categoryKey = null;
                if (matchedCategory) {
                    categoryKey = matchedCategory;
                } else if (categoryMap["기타"]) {
                    categoryKey = "기타";
                } else {
                    return;
                }

                // 카테고리별 재고 맵 초기화
                if (!prevStockByCategory[categoryKey]) {
                    prevStockByCategory[categoryKey] = {};
                }
                if (!prevStockByCategory[categoryKey][materialId]) {
                    prevStockByCategory[categoryKey][materialId] = { qty: 0, price };
                }

                // 자재별 이력 추적
                if (!materialHistory[materialId]) {
                    materialHistory[materialId] = {
                        productInfo: product ? {
                            name: product.name,
                            material_code: product.material_code,
                            big_category: product.big_category,
                            price: product.price
                        } : null,
                        inputRecords: [],
                        outputRecords: [],
                        totalInput: 0,
                        totalOutput: 0
                    };
                }

                // 이력 기록
                const record = {
                    date: item.date,
                    quantity: qty,
                    type: type
                };

                if (type === "prevInput") {
                    materialHistory[materialId].inputRecords.push(record);
                    materialHistory[materialId].totalInput += qty;
                } else {
                    materialHistory[materialId].outputRecords.push(record);
                    materialHistory[materialId].totalOutput += qty;
                }

                // 수량 계산 (입고는 +, 출고는 -)
                const qtyChange = (type === "prevInput") ? qty : -qty;
                prevStockByCategory[categoryKey][materialId].qty += qtyChange;

                // 음수 qty 추적
                if (prevStockByCategory[categoryKey][materialId].qty < 0) {
                    // 음수 재고는 계산에서 제외됨
                }
            });
        };

        // 현재 월 데이터 처리
        const processCurrentMonth = (records, type) => {
            records.forEach(item => {
                const product = item.product;
                if (!product) {
                    console.warn(`[current-${type}] product is null for material_id:`, item.material_id);
                    return;
                }

                const materialId = product.material_id;
                const price = product.price ?? 0;
                const qty = item.quantity ?? 0;
                const rawCategory = product.get("big_category") || "";
                // big_category가 숫자인 경우 문자열로 변환
                const categoryStr = typeof rawCategory === 'number' ? rawCategory.toString() : rawCategory;
                const upperCategory = categoryStr.replace(/\s+/g, '').toUpperCase();
                const matchedCategory = categoryMap[upperCategory];

                let categoryKey = null;
                if (matchedCategory) {
                    categoryKey = matchedCategory;
                } else if (categoryMap["기타"]) {
                    categoryKey = "기타";
                } else {
                    return;
                }

                const amount = price * qty;

                // 현재 월 데이터 처리 (금액 단위)
                if (type === "input") {
                    resultByCategory[categoryKey].input += amount;
                } else if (type === "output") {
                    resultByCategory[categoryKey].output += amount;
                }
            });
        };

        // 전월재고 계산
        processPrevStock(prevInputs, "prevInput");
        processPrevStock(prevOutputs, "prevOutput");

        // 전월재고를 금액 단위로 변환하여 resultByCategory에 저장
        for (const categoryKey in prevStockByCategory) {
            if (resultByCategory[categoryKey]) {
                let totalPrevStock = 0;
                let negativeStockCount = 0;
                let negativeStockAmount = 0;

                for (const materialId in prevStockByCategory[categoryKey]) {
                    const { qty, price } = prevStockByCategory[categoryKey][materialId];
                    const amount = qty * price;

                    if (qty > 0) {
                        totalPrevStock += amount;
                    } else if (qty < 0) {
                        negativeStockCount++;
                        negativeStockAmount += amount;
                        // 음수 재고는 계산에서 제외됨
                    }
                }

                // ApiMainProduct에서 더해진 prevStock에 dynamic calculation 결과 더하기
                resultByCategory[categoryKey].prevStock += totalPrevStock;
            }
        }

        // 음수 재고는 계산에서 제외됨

        // 현재 월 데이터 처리
        processCurrentMonth(thisMonthInputs, "input");
        processCurrentMonth(thisMonthOutputs, "output");

        // 연간 총 입고 금액 계산 (1월부터 현재 월까지의 누적)
        let yearTotalInputAmount = 0;

        // 1. Dynamic Input 누적
        cumulativeInputs.forEach(item => {
            const product = item.product;
            if (!product) {
                console.warn(`[yearTotalInput] product is null for material_id:`, item.material_id);
                return;
            }

            // 카테고리 체크
            const rawCategory = product.get("big_category") || "";
            const categoryStr = typeof rawCategory === 'number' ? rawCategory.toString() : rawCategory;
            const upperCategory = categoryStr.replace(/\s+/g, '').toUpperCase();
            const matchedCategory = categoryMap[upperCategory];

            let categoryKey = null;
            if (matchedCategory) {
                categoryKey = matchedCategory;
            } else if (categoryMap["기타"]) {
                categoryKey = "기타";
            } else {
                return; // 선택된 카테고리에 해당하지 않으면 제외
            }

            const price = product.price ?? 0;
            const qty = item.quantity ?? 0;
            yearTotalInputAmount += price * qty;
        });

        // 2. ApiMainProduct 누적 (yearStartDate <= date <= cumulativeEndDate)
        apiMainProducts.forEach(item => {
            const itemDate = new Date(item.date);
            if (itemDate >= yearStartDate && itemDate <= cumulativeEndDate) {
                // 카테고리 체크
                const rawCategory = item.big_category || "";
                const categoryStr = typeof rawCategory === 'number' ? rawCategory.toString() : rawCategory;
                const upperCategory = categoryStr.replace(/\s+/g, '').toUpperCase();
                const matchedCategory = categoryMap[upperCategory];

                let categoryKey = null;
                if (matchedCategory) {
                    categoryKey = matchedCategory;
                } else if (categoryMap["기타"]) {
                    categoryKey = "기타";
                } else {
                    return; // 선택된 카테고리에 해당하지 않으면 제외
                }

                const price = item.price || 0;
                const qty = item.quantity || 0;
                yearTotalInputAmount += price * qty;
            }
        });

        // 현재 월 말일 재고 계산 (전월재고 + 현재 월 입고 - 현재 월 출고)
        for (const categoryKey in resultByCategory) {
            if (categoryKey !== "합 계") {
                resultByCategory[categoryKey].remaining =
                    resultByCategory[categoryKey].prevStock +
                    resultByCategory[categoryKey].input -
                    resultByCategory[categoryKey].output;
            }
        }


        const totalExecutedAmount = Object.values(resultByCategory)
            .reduce((acc, cur) => acc + cur.output, 0);

        let executionRate = null;
        if (typeof budget === "number" && budget > 0) {
            executionRate = Number(((totalExecutedAmount / budget) * 100).toFixed(2));
        }

        // 🔥 합 계 항목 추가
        const totalSummary = {
            prevStock: 0,
            input: 0,
            output: 0,
            remaining: 0,
        };
        for (const categoryKey in resultByCategory) {
            if (categoryKey !== "합 계") { // "합 계" 항목은 제외하고 계산
                const item = resultByCategory[categoryKey];
                totalSummary.prevStock += item.prevStock;
                totalSummary.input += item.input;
                totalSummary.output += item.output;
                totalSummary.remaining += item.remaining;
            }
        }
        resultByCategory["합 계"] = totalSummary;

        res.json({
            byCategory: resultByCategory,
            totalExecutedAmount,
            executionRate,
            yearTotalInputAmount,
        });
    } catch (err) {
        // 테이블이 없는 경우 (예: 관리 부서) 정상적인 빈 응답 반환
        if (err.name === 'SequelizeDatabaseError' && err.parent && err.parent.code === 'ER_NO_SUCH_TABLE') {
            return res.json({
                byCategory: {},
                totalExecutedAmount: 0,
                executionRate: 0,
                yearTotalInputAmount: 0,
            });
        }

        console.error("Error processing statement:", err);
        console.error("Error details:", {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        res.status(500).json({
            message: "서버 오류",
            error: err.message,
            details: err.stack
        });
    }
});

// 전파트 월간보고서 엔드포인트
router.post("/all-part-monthly", async (req, res) => {
    const { businessLocation, year, month, budget } = req.body;

    if (!businessLocation || !year || !month) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
    }

    try {
        // ITS, 시설, 기전 부서의 데이터를 각각 조회
        const departments = ["ITS", "시설", "기전"];
        const allPartData = {};

        for (const department of departments) {
            try {
                const { Product, Input, Output } = createModels(businessLocation, department);

                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);
                endDate.setHours(23, 59, 59, 999);

                let prevEndDate;
                if (month === 1) {
                    prevEndDate = new Date(year - 1, 11, 31);
                } else {
                    prevEndDate = new Date(year, month - 1, 0);
                }
                prevEndDate.setHours(23, 59, 59, 999);

                const yearStartDate = new Date(year, 0, 1);
                const yearEndDate = new Date(year, 11, 31);
                yearEndDate.setHours(23, 59, 59, 999);

                const cumulativeEndDate = new Date(year, month, 0);
                cumulativeEndDate.setHours(23, 59, 59, 999);

                const includeProduct = {
                    model: Product,
                    as: "product",
                    attributes: ["material_id", "price", "big_category"],
                };

                let prevInputs = [], prevOutputs = [], thisMonthInputs = [], thisMonthOutputs = [], cumulativeInputs = [];

                try {
                    [prevInputs, prevOutputs, thisMonthInputs, thisMonthOutputs, cumulativeInputs] = await Promise.all([
                        Input.findAll({
                            where: { date: { [Op.lte]: prevEndDate } },
                            attributes: ["material_id", "quantity", "date"],
                            include: [includeProduct],
                        }),
                        Output.findAll({
                            where: { date: { [Op.lte]: prevEndDate } },
                            attributes: ["material_id", "quantity", "date"],
                            include: [includeProduct],
                        }),
                        Input.findAll({
                            where: { date: { [Op.gte]: startDate, [Op.lte]: endDate } },
                            attributes: ["material_id", "quantity"],
                            include: [includeProduct],
                        }),
                        Output.findAll({
                            where: { date: { [Op.gte]: startDate, [Op.lte]: endDate } },
                            attributes: ["material_id", "quantity"],
                            include: [includeProduct],
                        }),
                        Input.findAll({
                            where: { date: { [Op.gte]: yearStartDate, [Op.lte]: cumulativeEndDate } },
                            attributes: ["material_id", "quantity"],
                            include: [includeProduct],
                        }),
                    ]);
                } catch (error) {
                    if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
                        console.warn(`⚠️ 테이블이 존재하지 않음 (${department}), Local 데이터 없이 진행`);
                        // 빈 배열 유지
                    } else {
                        throw error;
                    }
                }

                // 부서별 카테고리 정의
                let departmentCategories = [];
                if (department === "ITS") {
                    departmentCategories = ["TCS", "FTMS", "전산", "기타"];
                } else if (department === "시설") {
                    departmentCategories = ["안전", "장비", "시설보수", "조경", "기타"];
                } else if (department === "기전") {
                    departmentCategories = ["전기", "기계", "소방", "기타"];
                }

                const normalizedCategories = departmentCategories.map(cat => cat.replace(/\s+/g, '').toUpperCase());
                const categoryMap = {};
                departmentCategories.forEach(cat => {
                    const upper = cat.replace(/\s+/g, '').toUpperCase();
                    categoryMap[upper] = cat;
                });

                const resultByCategory = {};
                departmentCategories.forEach(cat => {
                    resultByCategory[cat] = {
                        prevStock: 0,
                        input: 0,
                        output: 0,
                        remaining: 0,
                    };
                });

                // 🔹 ApiMainProduct 데이터 조회 및 처리 (전파트 월간)
                // 사업소 이름 매핑 (Code -> Name)
                const locationMap = {
                    'GK': 'GK사업소',
                };
                const locationName = locationMap[businessLocation] || businessLocation;

                const apiMainProducts = await ApiMainProduct.findAll({
                    where: {
                        business_location: {
                            [Op.or]: [businessLocation, locationName]
                        },
                        department: department
                    },
                    raw: true
                });

                apiMainProducts.forEach(item => {
                    const itemDate = new Date(item.date);
                    const price = item.price || 0;
                    const qty = item.quantity || 0;
                    const amount = price * qty;

                    const rawCategory = item.big_category || "";
                    const categoryStr = typeof rawCategory === 'number' ? rawCategory.toString() : rawCategory;
                    const upperCategory = categoryStr.replace(/\s+/g, '').toUpperCase();
                    const matchedCategory = categoryMap[upperCategory];

                    let categoryKey = null;
                    if (matchedCategory) {
                        categoryKey = matchedCategory;
                    } else if (categoryMap["기타"]) {
                        categoryKey = "기타";
                    } else {
                        return;
                    }

                    if (!resultByCategory[categoryKey]) return;

                    // 1. 전월재고 (prevStock)
                    if (itemDate <= prevEndDate) {
                        resultByCategory[categoryKey].prevStock += amount;
                    }

                    // 2. 당월입고 (input)
                    if (itemDate >= startDate && itemDate <= endDate) {
                        resultByCategory[categoryKey].input += amount;
                    }
                });

                const prevStockByCategory = {};

                const processPrevStock = (records, type) => {
                    records.forEach(item => {
                        const product = item.product;
                        if (!product) return;

                        const materialId = product.material_id;
                        const price = product.price ?? 0;
                        const qty = item.quantity ?? 0;
                        const rawCategory = product.get("big_category") || "";
                        const categoryStr = typeof rawCategory === 'number' ? rawCategory.toString() : rawCategory;
                        const upperCategory = categoryStr.replace(/\s+/g, '').toUpperCase();
                        const matchedCategory = categoryMap[upperCategory];

                        let categoryKey = null;
                        if (matchedCategory) {
                            categoryKey = matchedCategory;
                        } else if (categoryMap["기타"]) {
                            categoryKey = "기타";
                        } else {
                            return;
                        }

                        if (!prevStockByCategory[categoryKey]) {
                            prevStockByCategory[categoryKey] = {};
                        }
                        if (!prevStockByCategory[categoryKey][materialId]) {
                            prevStockByCategory[categoryKey][materialId] = { qty: 0, price };
                        }

                        const qtyChange = (type === "prevInput") ? qty : -qty;
                        prevStockByCategory[categoryKey][materialId].qty += qtyChange;
                    });
                };

                const processCurrentMonth = (records, type) => {
                    records.forEach(item => {
                        const product = item.product;
                        if (!product) return;

                        const materialId = product.material_id;
                        const price = product.price ?? 0;
                        const qty = item.quantity ?? 0;
                        const rawCategory = product.get("big_category") || "";
                        const categoryStr = typeof rawCategory === 'number' ? rawCategory.toString() : rawCategory;
                        const upperCategory = categoryStr.replace(/\s+/g, '').toUpperCase();
                        const matchedCategory = categoryMap[upperCategory];

                        let categoryKey = null;
                        if (matchedCategory) {
                            categoryKey = matchedCategory;
                        } else if (categoryMap["기타"]) {
                            categoryKey = "기타";
                        } else {
                            return;
                        }

                        const amount = price * qty;

                        if (type === "input") {
                            resultByCategory[categoryKey].input += amount;
                        } else if (type === "output") {
                            resultByCategory[categoryKey].output += amount;
                        }
                    });
                };

                processPrevStock(prevInputs, "prevInput");
                processPrevStock(prevOutputs, "prevOutput");

                for (const categoryKey in prevStockByCategory) {
                    if (resultByCategory[categoryKey]) {
                        let totalPrevStock = 0;
                        for (const materialId in prevStockByCategory[categoryKey]) {
                            const { qty, price } = prevStockByCategory[categoryKey][materialId];
                            const amount = qty * price;
                            if (qty > 0) {
                                totalPrevStock += amount;
                            }
                        }
                        resultByCategory[categoryKey].prevStock += totalPrevStock; // ApiMainProduct 값에 더하기 is crucial
                    }
                }

                processCurrentMonth(thisMonthInputs, "input");
                processCurrentMonth(thisMonthOutputs, "output");

                for (const categoryKey in resultByCategory) {
                    resultByCategory[categoryKey].remaining =
                        resultByCategory[categoryKey].prevStock +
                        resultByCategory[categoryKey].input -
                        resultByCategory[categoryKey].output;
                }

                let yearTotalInputAmount = 0;
                cumulativeInputs.forEach(item => {
                    const product = item.product;
                    if (!product) return;
                    const price = product.price ?? 0;
                    const qty = item.quantity ?? 0;
                    yearTotalInputAmount += price * qty;
                });

                // ApiMainProduct Year Total
                apiMainProducts.forEach(item => {
                    const itemDate = new Date(item.date);
                    if (itemDate >= yearStartDate && itemDate <= cumulativeEndDate) {
                        const price = item.price || 0;
                        const qty = item.quantity || 0;
                        yearTotalInputAmount += price * qty;
                    }
                });

                // 각 부서별 합계 계산 (하위 카테고리의 합계)
                const departmentTotal = {
                    prevStock: 0,
                    input: 0,
                    output: 0,
                    remaining: 0,
                };

                departmentCategories.forEach(cat => {
                    const data = resultByCategory[cat] || { prevStock: 0, input: 0, output: 0, remaining: 0 };
                    departmentTotal.prevStock += data.prevStock;
                    departmentTotal.input += data.input;
                    departmentTotal.output += data.output;
                    departmentTotal.remaining += data.remaining;
                });

                allPartData[department] = {
                    byCategory: resultByCategory,
                    total: departmentTotal, // 부서별 합계 추가
                    yearTotalInputAmount
                };
            } catch (deptError) {
                console.error(`\n❌ [${department}] 부서 데이터 처리 중 오류 발생:`, deptError);
                console.error(`   - 오류 메시지:`, deptError.message);
                console.error(`   - 스택 트레이스:`, deptError.stack);

                // 오류 발생 시 빈 데이터로 초기화하여 다음 부서 처리에 영향 없도록 함
                allPartData[department] = {
                    byCategory: {},
                    total: { prevStock: 0, input: 0, output: 0, remaining: 0 },
                    yearTotalInputAmount: 0
                };

                // 부서별 카테고리 정의 (오류 시 빈 카테고리로 초기화)
                if (department === "ITS") {
                    ["TCS", "FTMS", "전산", "기타"].forEach(cat => {
                        allPartData[department].byCategory[cat] = { prevStock: 0, input: 0, output: 0, remaining: 0 };
                    });
                } else if (department === "시설") {
                    ["안전", "장비", "시설보수", "조경", "기타"].forEach(cat => {
                        allPartData[department].byCategory[cat] = { prevStock: 0, input: 0, output: 0, remaining: 0 };
                    });
                } else if (department === "기전") {
                    ["전기", "기계", "소방", "기타"].forEach(cat => {
                        allPartData[department].byCategory[cat] = { prevStock: 0, input: 0, output: 0, remaining: 0 };
                    });
                }
            }
        }

        // 전파트 월간보고서 구조 생성
        // 각 부서별 합계는 이미 allPartData[department].total에 저장되어 있음

        // 최종 결과 구조
        const resultByCategory = {
            "ITS": allPartData["ITS"]?.total || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "TCS": allPartData["ITS"]?.byCategory?.["TCS"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "FTMS": allPartData["ITS"]?.byCategory?.["FTMS"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "전산": allPartData["ITS"]?.byCategory?.["전산"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "기타": allPartData["ITS"]?.byCategory?.["기타"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "시설": allPartData["시설"]?.total || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "안전": allPartData["시설"]?.byCategory?.["안전"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "장비": allPartData["시설"]?.byCategory?.["장비"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "시설보수": allPartData["시설"]?.byCategory?.["시설보수"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "조경": allPartData["시설"]?.byCategory?.["조경"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "시설_기타": allPartData["시설"]?.byCategory?.["기타"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "기전": allPartData["기전"]?.total || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "전기": allPartData["기전"]?.byCategory?.["전기"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "기계": allPartData["기전"]?.byCategory?.["기계"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "소방": allPartData["기전"]?.byCategory?.["소방"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "기전_기타": allPartData["기전"]?.byCategory?.["기타"] || { prevStock: 0, input: 0, output: 0, remaining: 0 },
            "합 계": {
                prevStock: (allPartData["ITS"]?.total?.prevStock || 0) + (allPartData["시설"]?.total?.prevStock || 0) + (allPartData["기전"]?.total?.prevStock || 0),
                input: (allPartData["ITS"]?.total?.input || 0) + (allPartData["시설"]?.total?.input || 0) + (allPartData["기전"]?.total?.input || 0),
                output: (allPartData["ITS"]?.total?.output || 0) + (allPartData["시설"]?.total?.output || 0) + (allPartData["기전"]?.total?.output || 0),
                remaining: (allPartData["ITS"]?.total?.remaining || 0) + (allPartData["시설"]?.total?.remaining || 0) + (allPartData["기전"]?.total?.remaining || 0),
            }
        };

        const totalExecutedAmount = resultByCategory["합 계"].output;
        let executionRate = null;
        if (typeof budget === "number" && budget > 0) {
            executionRate = Number(((totalExecutedAmount / budget) * 100).toFixed(2));
        }

        const yearTotalInputAmount = (allPartData["ITS"]?.yearTotalInputAmount || 0) + (allPartData["시설"]?.yearTotalInputAmount || 0) + (allPartData["기전"]?.yearTotalInputAmount || 0);

        // 부서별 집행누계 금액
        const departmentYearTotalInputAmount = {
            ITS: allPartData["ITS"]?.yearTotalInputAmount || 0,
            시설: allPartData["시설"]?.yearTotalInputAmount || 0,
            기전: allPartData["기전"]?.yearTotalInputAmount || 0,
        };

        res.json({
            byCategory: resultByCategory,
            totalExecutedAmount,
            executionRate,
            yearTotalInputAmount,
            departmentYearTotalInputAmount, // 부서별 집행누계 금액 추가
        });
    } catch (err) {
        console.error("Error processing all-part monthly statement:", err);
        res.status(500).json({
            message: "서버 오류",
            error: err.message,
        });
    }
});

// 연간 입/출고 추세 일괄 조회 (Dashboard 용)
router.post("/yearly-trend", async (req, res) => {
    const { businessLocation, year } = req.body;

    if (!businessLocation || !year) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
    }

    try {
        const departments = ["ITS", "시설", "기전"];

        // 1. 사업소 정규화
        const locationMap = {
            'GK': 'GK사업소',
            // 필요 시 추가
        };
        const locationName = locationMap[businessLocation] || businessLocation;

        // 2. 날짜 범위 설정 (1월 1일 ~ 12월 31일)
        const yearStartDate = new Date(year, 0, 1);
        const yearEndDate = new Date(year, 11, 31);
        yearEndDate.setHours(23, 59, 59, 999);

        // 3. 전년도 말일 (기초 재고 계산용)
        const prevYearEndDate = new Date(year - 1, 11, 31);
        prevYearEndDate.setHours(23, 59, 59, 999);

        // 결과 저장 구조 초기화
        // trend[month - 1] = { month: m, byDept: { ITS: { input: 0, output: 0 }, ... } }
        const trend = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            byDept: {
                "ITS": { input: 0, output: 0 },
                "시설": { input: 0, output: 0 },
                "기전": { input: 0, output: 0 },
                "합 계": { input: 0, output: 0 }
            }
        }));

        // 각 부서별로 데이터 조회 및 집계
        for (const department of departments) {
            try {
                const { Product, Input, Output } = createModels(businessLocation, department);

                // Product 정보 미리 로드 (가격 정보 필요)
                // 메모리 효율을 위해 필요한 필드만 조회
                const allProducts = await Product.findAll({
                    attributes: ['material_id', 'price'],
                    raw: true
                });
                const productMap = new Map();
                allProducts.forEach(p => {
                    productMap.set(p.material_id, p.price || 0);
                });

                // -----------------------------------------------------
                // ApiMainProduct Price Info (for Local Outputs referencing API products)
                // -----------------------------------------------------
                try {
                    const apiProductsPrices = await ApiMainProduct.findAll({
                        attributes: ['material_id', 'price'],
                        where: {
                            business_location: {
                                [Op.or]: [businessLocation, locationName]
                            },
                            department: department
                        },
                        raw: true
                    });
                    apiProductsPrices.forEach(p => {
                        // Local Product takes precedence, but if acceptable, overwrite or set if missing.
                        // Usually API product ID should be unique or match.
                        // Here we set if not exists, or update.
                        if (!productMap.has(p.material_id)) {
                            productMap.set(p.material_id, p.price || 0);
                        }
                    });
                } catch (apiErr) {
                    console.warn(`ApiMainProduct price fetch failed for ${department} (ignored):`, apiErr.message);
                }

                // -----------------------------------------------------
                // Local Input Data (1월 ~ 12월)
                // -----------------------------------------------------
                let localInputs = [];
                try {
                    localInputs = await Input.findAll({
                        where: {
                            date: {
                                [Op.gte]: yearStartDate,
                                [Op.lte]: yearEndDate
                            }
                        },
                        attributes: ['material_id', 'quantity', 'date'],
                        raw: true
                    });
                } catch (err) {
                    if (err.parent && err.parent.code === 'ER_NO_SUCH_TABLE') {
                        // 테이블 없으면 pass
                    } else {
                        throw err;
                    }
                }

                localInputs.forEach(item => {
                    const m = new Date(item.date).getMonth(); // 0~11
                    const price = productMap.get(item.material_id) || 0;
                    const amount = item.quantity * price;

                    trend[m].byDept[department].input += amount;
                    trend[m].byDept["합 계"].input += amount;
                });

                // -----------------------------------------------------
                // Local Output Data (1월 ~ 12월)
                // -----------------------------------------------------
                let localOutputs = [];
                try {
                    localOutputs = await Output.findAll({
                        where: {
                            date: {
                                [Op.gte]: yearStartDate,
                                [Op.lte]: yearEndDate
                            }
                        },
                        attributes: ['material_id', 'quantity', 'date'],
                        raw: true
                    });
                } catch (err) {
                    if (err.parent && err.parent.code === 'ER_NO_SUCH_TABLE') {
                        // pass
                    } else {
                        throw err;
                    }
                }

                localOutputs.forEach(item => {
                    const m = new Date(item.date).getMonth(); // 0~11
                    const price = productMap.get(item.material_id) || 0;
                    const amount = item.quantity * price;

                    trend[m].byDept[department].output += amount;
                    trend[m].byDept["합 계"].output += amount;
                });

                // -----------------------------------------------------
                // ApiMainProduct Data (Input Only) (1월 ~ 12월)
                // -----------------------------------------------------
                const apiInputs = await ApiMainProduct.findAll({
                    where: {
                        business_location: {
                            [Op.or]: [businessLocation, locationName]
                        },
                        department: department,
                        date: {
                            [Op.gte]: yearStartDate,
                            [Op.lte]: yearEndDate
                        }
                    },
                    attributes: ['price', 'quantity', 'date'],
                    raw: true
                });

                apiInputs.forEach(item => {
                    const m = new Date(item.date).getMonth(); // 0~11
                    const amount = (item.quantity || 0) * (item.price || 0);

                    trend[m].byDept[department].input += amount;
                    trend[m].byDept["합 계"].input += amount;
                });

            } catch (deptErr) {
                console.error(`Error processing department ${department}:`, deptErr.message);
                // Continue to next department
            }
        }

        res.json(trend);

    } catch (error) {
        console.error("Error processing yearly trend:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

module.exports = router;

