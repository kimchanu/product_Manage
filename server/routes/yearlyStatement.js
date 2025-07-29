const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { createModels } = require("../models/material");

router.post("/", async (req, res) => {
    const { businessLocation, department, year, categories } = req.body;

    if (!businessLocation || !department || !year || !Array.isArray(categories)) {
        return res.status(400).json({ message: "필수 정보가 누락되었거나 잘못된 형식입니다." });
    }

    try {
        const { Product, Input, Output } = createModels(businessLocation, department);

        const normalizedCategories = categories.map(cat => cat.trim().toUpperCase());
        const categoryMap = {};

        categories.forEach(cat => {
            const upper = cat.trim().toUpperCase();
            categoryMap[upper] = cat;
        });

        // 전년도 말일까지의 재고 데이터 조회 (Statement와 동일한 방식)
        const prevYearEndDate = new Date(year - 1, 11, 31); // 전년도 12월 31일
        prevYearEndDate.setHours(23, 59, 59, 999);

        const [prevYearInputs, prevYearOutputs] = await Promise.all([
            Input.findAll({
                where: { date: { [Op.lte]: prevYearEndDate } },
                attributes: ["material_id", "quantity"],
                include: [{
                    model: Product,
                    as: "product",
                    attributes: ["material_id", "price", "big_category"],
                }],
            }),
            Output.findAll({
                where: { date: { [Op.lte]: prevYearEndDate } },
                attributes: ["material_id", "quantity"],
                include: [{
                    model: Product,
                    as: "product",
                    attributes: ["material_id", "price", "big_category"],
                }],
            }),
        ]);

        // 전년도 말일까지의 재고 계산을 위한 stockMap
        const stockMap = {};

        // 전년도 데이터 처리
        const processPrevYear = (records, type) => {
            records.forEach(item => {
                const product = item.product;
                if (!product) return;

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

                if (!stockMap[materialId]) {
                    stockMap[materialId] = { qty: 0, price, category: categoryKey };
                }

                stockMap[materialId].qty += (type === "input") ? qty : -qty;
            });
        };

        processPrevYear(prevYearInputs, "input");
        processPrevYear(prevYearOutputs, "output");

        // 1월부터 12월까지의 월별 데이터 조회
        const monthlyData = {};

        for (let month = 1; month <= 12; month++) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            endDate.setHours(23, 59, 59, 999);

            const [monthlyInputs, monthlyOutputs] = await Promise.all([
                Input.findAll({
                    where: { date: { [Op.between]: [startDate, endDate] } },
                    attributes: ["material_id", "quantity"],
                    include: [{
                        model: Product,
                        as: "product",
                        attributes: ["material_id", "price", "big_category"],
                    }],
                }),
                Output.findAll({
                    where: { date: { [Op.between]: [startDate, endDate] } },
                    attributes: ["material_id", "quantity"],
                    include: [{
                        model: Product,
                        as: "product",
                        attributes: ["material_id", "price", "big_category"],
                    }],
                }),
            ]);

            // 카테고리별 데이터 처리
            const monthData = {};
            categories.forEach(cat => {
                monthData[cat] = { input: 0, output: 0, remaining: 0 };
            });

            // Statement와 동일한 방식으로 데이터 처리
            const process = (records, type) => {
                records.forEach(item => {
                    const product = item.product;
                    if (!product) return;

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
                        case "input":
                            monthData[categoryKey].input += amount;
                            break;
                        case "output":
                            monthData[categoryKey].output += amount;
                            break;
                    }

                    if (!stockMap[materialId]) {
                        stockMap[materialId] = { qty: 0, price, category: categoryKey };
                    }

                    stockMap[materialId].qty += (type === "input") ? qty : -qty;
                });
            };

            process(monthlyInputs, "input");
            process(monthlyOutputs, "output");

            // Statement와 동일한 방식으로 remaining 계산
            for (const materialId in stockMap) {
                const { qty, price, category } = stockMap[materialId];
                if (qty > 0 && monthData[category]) {
                    monthData[category].remaining += qty * price;
                }
            }

            monthlyData[month] = monthData;
        }

        // 연간 합계 계산
        const yearlyTotals = {};
        categories.forEach(cat => {
            yearlyTotals[cat] = { input: 0, output: 0, remaining: 0 };
            for (let month = 1; month <= 12; month++) {
                yearlyTotals[cat].input += monthlyData[month][cat].input;
                yearlyTotals[cat].output += monthlyData[month][cat].output;
                // remaining은 마지막 월의 remaining 값을 사용 (누적 재고)
                if (month === 12) {
                    yearlyTotals[cat].remaining = monthlyData[month][cat].remaining;
                }
            }
        });

        res.json({
            monthlyData,
            yearlyTotals,
            year
        });

    } catch (err) {
        console.error("Error processing yearly statement:", err);
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