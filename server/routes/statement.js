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
            resultByCategory[cat] = {
                prevStock: 0,
                input: 0,
                output: 0,
                remaining: 0,
            };
            categoryMap[upper] = cat;
        });

        const stockMap = {};

        const process = (records, type) => {
            records.forEach(item => {
                const product = item.product;
                if (!product) {
                    console.warn(`[${type}] product is null for material_id:`, item.material_id);
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

                switch (type) {
                    case "prevInput":
                        resultByCategory[categoryKey].prevStock += amount;
                        break;
                    case "prevOutput":
                        resultByCategory[categoryKey].prevStock -= amount;
                        break;
                    case "input":
                        resultByCategory[categoryKey].input += amount;
                        break;
                    case "output":
                        resultByCategory[categoryKey].output += amount;
                        break;
                }

                if (!stockMap[materialId]) {
                    stockMap[materialId] = { qty: 0, price, category: categoryKey };
                }

                stockMap[materialId].qty += (type === "input" || type === "prevInput") ? qty : -qty;
            });
        };

        process(prevInputs, "prevInput");
        process(prevOutputs, "prevOutput");
        process(thisMonthInputs, "input");
        process(thisMonthOutputs, "output");

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

        for (const materialId in stockMap) {
            const { qty, price, category } = stockMap[materialId];
            if (qty > 0 && resultByCategory[category]) {
                resultByCategory[category].remaining += qty * price;
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
            const item = resultByCategory[categoryKey];
            totalSummary.prevStock += item.prevStock;
            totalSummary.input += item.input;
            totalSummary.output += item.output;
            totalSummary.remaining += item.remaining;
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
