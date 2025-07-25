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
                monthData[cat] = { input: 0, output: 0 };
            });

            // 입고 데이터 처리
            monthlyInputs.forEach(item => {
                const product = item.product;
                if (!product) return;

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

                monthData[categoryKey].input += price * qty;
            });

            // 출고 데이터 처리
            monthlyOutputs.forEach(item => {
                const product = item.product;
                if (!product) return;

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

                monthData[categoryKey].output += price * qty;
            });

            monthlyData[month] = monthData;
        }

        // 연간 합계 계산
        const yearlyTotals = {};
        categories.forEach(cat => {
            yearlyTotals[cat] = { input: 0, output: 0 };
            for (let month = 1; month <= 12; month++) {
                yearlyTotals[cat].input += monthlyData[month][cat].input;
                yearlyTotals[cat].output += monthlyData[month][cat].output;
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