const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { createModels } = require("../models/material");

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

        const prevEndDate = new Date(year, month - 1, 0); // 전월 말일
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

        const [prevInputs, prevOutputs, thisMonthInputs, thisMonthOutputs, yearTotalInputs, cumulativeInputs] = await Promise.all([
            Input.findAll({
                where: { date: { [Op.lte]: prevEndDate } },
                attributes: ["material_id", "quantity"],
                include: [includeProduct],
            }),
            Output.findAll({
                where: { date: { [Op.lte]: prevEndDate } },
                attributes: ["material_id", "quantity"],
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

        const resultByCategory = {};
        const normalizedCategories = categories.map(cat => cat.trim().toUpperCase());
        const categoryMap = {};

        categories.forEach(cat => {
            const upper = cat.trim().toUpperCase();
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

        // 전월재고 계산을 위한 stockMap (전월 말일까지의 누적 재고)
        const prevStockMap = {};

        // 전월재고 계산: 전월 말일까지의 모든 입고/출고 데이터로 계산 (수량 단위)
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
                const upperCategory = rawCategory.trim().toUpperCase();
                const matchedCategory = categoryMap[upperCategory];

                let categoryKey = null;
                if (matchedCategory) {
                    categoryKey = matchedCategory;
                } else if (categoryMap["기타"]) {
                    categoryKey = "기타";
                } else {
                    return;
                }

                // 전월재고 stockMap 업데이트 (수량 단위)
                if (!prevStockMap[materialId]) {
                    prevStockMap[materialId] = { qty: 0, price, category: categoryKey };
                }
                prevStockMap[materialId].qty += (type === "prevInput") ? qty : -qty;
            });
        };

        // 현재 월 데이터 처리를 위한 stockMap
        const currentStockMap = {};

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
                const upperCategory = rawCategory.trim().toUpperCase();
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

                // 현재 월 stockMap 업데이트 (전월재고 + 현재 월 변동)
                if (!currentStockMap[materialId]) {
                    // 전월재고에서 시작
                    const prevStock = prevStockMap[materialId] || { qty: 0, price, category: categoryKey };
                    currentStockMap[materialId] = {
                        qty: prevStock.qty,
                        price,
                        category: categoryKey
                    };
                }
                currentStockMap[materialId].qty += (type === "input") ? qty : -qty;
            });
        };

        // 전월재고 계산 (수량 단위)
        processPrevStock(prevInputs, "prevInput");
        processPrevStock(prevOutputs, "prevOutput");

        // 전월재고를 금액 단위로 변환
        for (const materialId in prevStockMap) {
            const { qty, price, category } = prevStockMap[materialId];
            if (resultByCategory[category]) {
                resultByCategory[category].prevStock += qty * price;
            }
        }

        console.log('전월재고 계산 결과:', resultByCategory);

        // 현재 월 데이터 처리
        processCurrentMonth(thisMonthInputs, "input");
        processCurrentMonth(thisMonthOutputs, "output");

        // 연간 총 입고 금액 계산 (1월부터 현재 월까지의 누적)
        let yearTotalInputAmount = 0;
        cumulativeInputs.forEach(item => {
            const product = item.product;
            if (!product) {
                console.warn(`[yearTotalInput] product is null for material_id:`, item.material_id);
                return;
            }

            const price = product.price ?? 0;
            const qty = item.quantity ?? 0;
            yearTotalInputAmount += price * qty;
        });

        // 현재 월 말일 재고 계산 (전월재고 + 현재 월 입고 - 현재 월 출고)
        // 먼저 모든 카테고리의 재고를 전월재고로 초기화
        for (const categoryKey in resultByCategory) {
            resultByCategory[categoryKey].remaining = resultByCategory[categoryKey].prevStock;
        }

        // 현재 월 변동이 있는 물품들에 대해서만 재고 계산 추가
        for (const materialId in currentStockMap) {
            const { qty, price, category } = currentStockMap[materialId];
            if (resultByCategory[category]) {
                // 전월재고 수량 계산
                const prevStockQty = prevStockMap[materialId]?.qty || 0;
                // 현재 월 변동량 계산 (현재 월 입고 - 출고)
                const currentMonthChange = (qty - prevStockQty) * price;
                resultByCategory[category].remaining += currentMonthChange;
            }
        }

        console.log('최종 재고 계산 결과:', resultByCategory);

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

module.exports = router;
