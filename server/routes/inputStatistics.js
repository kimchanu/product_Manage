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
        endDate.setHours(23, 59, 59, 999); // 월말을 정확히 설정

        console.log(`Requested year: ${year}, month: ${month}`);
        console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

        // 자재 정보 조회 (전체 자재)
        const allProducts = await Product.findAll({
            attributes: ['material_id', 'price', 'name'],
            raw: true
        });

        // 자재 정보를 Map으로 변환
        const productMap = new Map(allProducts.map(p => [p.material_id, p]));

        // 총 입고 금액 (선택된 월의 데이터만)
        const totalInputs = await Input.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: ['quantity', 'date', 'material_id'],
            raw: true
        });

        const totalInputAmount = totalInputs.reduce((sum, input) => {
            const product = productMap.get(input.material_id);
            return sum + (input.quantity * (product?.price || 0));
        }, 0);

        console.log(`Total inputs found: ${totalInputs.length}`);
        console.log(`Total input amount: ${totalInputAmount}`);

        // 월 입고 금액
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
            return sum + (input.quantity * (product?.price || 0));
        }, 0);

        console.log(`Monthly inputs found: ${monthlyInputs.length}`);
        console.log(`Monthly input amount: ${monthlyInputAmount}`);

        // 월별 추이
        const monthlyTrend = await Promise.all(
            Array.from({ length: 12 }, (_, i) => i + 1).map(async (m) => {
                const monthStart = new Date(year, m - 1, 1);
                const monthEnd = new Date(year, m, 0);
                monthEnd.setHours(23, 59, 59, 999); // 월말을 정확히 설정

                console.log(`Month ${m}: ${monthStart.toISOString()} to ${monthEnd.toISOString()}`);

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

                console.log(`Month ${m} amount: ${monthAmount}`);
                return monthAmount;
            })
        );

        // 최근 입고 내역 (선택된 월의 데이터만)
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

        console.log(`Recent inputs found: ${recentInputs.length}`);
        console.log('Recent inputs:', recentInputs);

        // 입고 상위 자재 (선택된 월의 데이터만)
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

        res.json({
            totalInputAmount,
            monthlyInputAmount,
            monthlyTrend,
            recentInputs: recentInputs.map(input => ({
                name: productMap.get(input.material_id)?.name || 'Unknown',
                quantity: input.quantity,
                date: input.date
            })),
            inputTop5: inputTop5.map(item => ({
                name: productMap.get(item.material_id)?.name || 'Unknown',
                totalQuantity: item.totalQuantity
            }))
        });
    } catch (error) {
        console.error("입고 통계 조회 오류:", error);
        res.status(500).json({ message: error.message || "입고 통계 조회 중 오류가 발생했습니다." });
    }
});

module.exports = router; 