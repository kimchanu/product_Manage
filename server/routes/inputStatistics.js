const express = require("express");
const router = express.Router();
const { createModels } = require("../models/material");
const { Op } = require('sequelize');
const sequelize = require('../db2');

router.post("/", async (req, res) => {

    const { businessLocation, department, year, month } = req.body;
    if (!businessLocation || !department || !year || !month) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
    }

    try {
        const { Product, Input, Output } = createModels(businessLocation, department);

        if (!Product) {
            throw new Error("Product 모델을 찾을 수 없습니다.");
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        endDate.setHours(23, 59, 59, 999);

        console.log(`요청: ${year}년 ${month}월`);
        console.log(`해당 월 범위: ${startDate.toISOString()} ~ ${endDate.toISOString()}`);

        // 모든 자재 정보 조회
        const allProducts = await Product.findAll({
            attributes: ['material_id', 'price', 'name'],
            raw: true
        });
        const productMap = new Map(allProducts.map(p => [p.material_id, p]));

        // 🔹 누적 입고 데이터 조회 (해당 월 이전까지의 데이터)
        const cumulativeEndDate = new Date(year, month - 1, 0); // 해당 월의 마지막 날
        cumulativeEndDate.setHours(23, 59, 59, 999);

        const cumulativeInputs = await Input.findAll({
            where: {
                date: {
                    [Op.lte]: cumulativeEndDate
                }
            },
            order: [['date', 'ASC']],
            attributes: ['quantity', 'date', 'material_id'],
            raw: true
        });

        // 🔹 누적 입고 금액 계산 (해당 월 이전까지)
        const totalInputAmount = cumulativeInputs.reduce((sum, input) => {
            const product = productMap.get(input.material_id);
            const itemAmount = input.quantity * (product?.price || 0);
            return sum + itemAmount;
        }, 0);

        // 🔹 누적 입고 리스트 생성 (해당 월 이전까지)
        const cumulativeInputList = cumulativeInputs.map(input => ({
            name: productMap.get(input.material_id)?.name || 'Unknown',
            quantity: input.quantity,
            date: input.date
        }));

        console.log(`총 입고 건수: ${cumulativeInputs.length}, 누적 입고 금액: ${totalInputAmount}`);

        // 🔸 월 입고 금액 계산 (선택 월만)
        const monthlyInputs = await Input.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: ['quantity', 'date', 'material_id'],
            raw: true
        });

        const monthlyInputAmount = monthlyInputs.reduce((sum, input) => {
            const product = productMap.get(input.material_id);
            const itemAmount = input.quantity * (product?.price || 0);
            return sum + itemAmount;
        }, 0);

        console.log(`월 입고 금액: ${monthlyInputAmount}`);

        // 🔸 월별 추이 계산 (1~12월)
        const monthlyTrend = await Promise.all(
            Array.from({ length: 12 }, (_, i) => i + 1).map(async (m) => {
                const monthStart = new Date(year, m - 1, 1);
                const monthEnd = new Date(year, m, 0);
                monthEnd.setHours(23, 59, 59, 999);

                const monthInputs = await Input.findAll({
                    where: {
                        date: {
                            [Op.between]: [monthStart, monthEnd]
                        }
                    },
                    attributes: ['quantity', 'material_id'],
                    raw: true
                });

                const monthAmount = monthInputs.reduce((sum, input) => {
                    const product = productMap.get(input.material_id);
                    return sum + (input.quantity * (product?.price || 0));
                }, 0);

                return monthAmount;
            })
        );

        // 🔸 최근 입고 내역 (선택 월 기준 상위 5건)
        const recentInputs = await Input.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            limit: 5,
            order: [['date', 'DESC']],
            attributes: ['quantity', 'date', 'material_id'],
            raw: true
        });

        const formattedRecentInputs = recentInputs.map(input => ({
            name: productMap.get(input.material_id)?.name || 'Unknown',
            quantity: input.quantity,
            date: input.date
        }));

        // 🔸 입고 상위 자재 5종 (선택 월 기준)
        const inputTop5 = await Input.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                'material_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
            ],
            group: ['material_id'],
            order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
            limit: 5,
            raw: true
        });

        const formattedTop5 = inputTop5.map(item => ({
            name: productMap.get(item.material_id)?.name || 'Unknown',
            totalQuantity: item.totalQuantity
        }));

        // ✅ 최종 응답
        res.json({
            totalInputAmount,           // 전체 누적 입고 금액
            cumulativeInputList,       // 전체 누적 입고 리스트
            monthlyInputAmount,        // 월 입고 금액
            monthlyTrend,              // 월별 추이
            recentInputs: formattedRecentInputs, // 최근 입고 5건
            inputTop5: formattedTop5   // 입고 상위 5자재
        });

    } catch (error) {
        console.error("입고 통계 조회 오류:", error);
        res.status(500).json({ message: error.message || "입고 통계 조회 중 오류가 발생했습니다." });
    }
});

module.exports = router;
