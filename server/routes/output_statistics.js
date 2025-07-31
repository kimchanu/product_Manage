const express = require("express");
const router = express.Router();
const { createModels } = require("../models/material");
const createOutputModel = require('../models/OutputModel');
const { Op } = require('sequelize');
const sequelize = require('../db/sequelize');

router.post("/", async (req, res) => {
    const { businessLocation, department, year, month } = req.body;
    if (!businessLocation || !department || !year || !month) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
    }

    try {
        const { Product, Output } = createModels(businessLocation, department);

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

        // 🔹 누적 출고 데이터 조회 (해당 월까지의 데이터)
        // 해당 월의 마지막 날을 정확히 계산
        const cumulativeEndDate = new Date(year, month, 0);
        cumulativeEndDate.setHours(23, 59, 59, 999);

        console.log(`누적 계산 종료일: ${cumulativeEndDate.toISOString()}`);
        console.log(`요청: ${year}년 ${month}월, 누적 종료일: ${cumulativeEndDate.getFullYear()}년 ${cumulativeEndDate.getMonth() + 1}월 ${cumulativeEndDate.getDate()}일`);

        // 디버깅을 위해 실제 조회되는 데이터 확인
        const allOutputs = await Output.findAll({
            order: [['date', 'ASC']],
            attributes: ['quantity', 'date', 'material_id'],
            raw: true
        });
        console.log(`전체 출고 데이터 개수: ${allOutputs.length}`);
        if (allOutputs.length > 0) {
            console.log(`전체 데이터 날짜 범위: ${allOutputs[0].date} ~ ${allOutputs[allOutputs.length - 1].date}`);
        }

        const cumulativeOutputs = await Output.findAll({
            where: {
                date: {
                    [Op.lte]: cumulativeEndDate
                }
            },
            order: [['date', 'ASC']],
            attributes: ['quantity', 'date', 'material_id'],
            raw: true
        });

        // 🔹 누적 출고 금액 계산 (해당 월까지)
        const totalOutputAmount = cumulativeOutputs.reduce((sum, output) => {
            const product = productMap.get(output.material_id);
            const itemAmount = output.quantity * (product?.price || 0);
            return sum + itemAmount;
        }, 0);

        // 🔹 누적 출고 리스트 생성 (해당 월까지)
        const cumulativeOutputList = cumulativeOutputs.map(output => ({
            name: productMap.get(output.material_id)?.name || 'Unknown',
            quantity: output.quantity,
            date: output.date
        }));

        console.log(`총 출고 건수: ${cumulativeOutputs.length}, 누적 출고 금액: ${totalOutputAmount}`);
        console.log(`누적 데이터 날짜 범위: ${cumulativeOutputs.length > 0 ? cumulativeOutputs[0].date : 'N/A'} ~ ${cumulativeOutputs.length > 0 ? cumulativeOutputs[cumulativeOutputs.length - 1].date : 'N/A'}`);

        // 🔸 월 출고 금액 계산 (선택 월만)
        const monthlyOutputs = await Output.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: ['quantity', 'date', 'material_id'],
            raw: true
        });

        const monthlyOutputAmount = monthlyOutputs.reduce((sum, output) => {
            const product = productMap.get(output.material_id);
            const itemAmount = output.quantity * (product?.price || 0);
            return sum + itemAmount;
        }, 0);

        console.log(`월 출고 금액: ${monthlyOutputAmount}`);

        // 🔸 월별 추이 계산 (1~12월)
        const monthlyTrend = await Promise.all(
            Array.from({ length: 12 }, (_, i) => i + 1).map(async (m) => {
                const monthStart = new Date(year, m - 1, 1);
                const monthEnd = new Date(year, m, 0);
                monthEnd.setHours(23, 59, 59, 999);

                const monthOutputs = await Output.findAll({
                    where: {
                        date: {
                            [Op.between]: [monthStart, monthEnd]
                        }
                    },
                    attributes: ['quantity', 'material_id'],
                    raw: true
                });

                const monthAmount = monthOutputs.reduce((sum, output) => {
                    const product = productMap.get(output.material_id);
                    return sum + (output.quantity * (product?.price || 0));
                }, 0);

                return monthAmount;
            })
        );

        // 🔸 최근 출고 내역 (선택 월 기준 상위 5건)
        const recentOutputs = await Output.findAll({
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

        const formattedRecentOutputs = recentOutputs.map(output => ({
            name: productMap.get(output.material_id)?.name || 'Unknown',
            quantity: output.quantity,
            date: output.date
        }));

        // 🔸 출고 상위 자재 5종 (선택 월 기준)
        const outputTop5 = await Output.findAll({
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

        const formattedTop5 = outputTop5.map(item => ({
            name: productMap.get(item.material_id)?.name || 'Unknown',
            totalQuantity: item.totalQuantity
        }));

        // ✅ 최종 응답
        res.json({
            totalOutputAmount,           // 전체 누적 출고 금액
            cumulativeOutputList,       // 전체 누적 출고 리스트
            monthlyOutputAmount,        // 월 출고 금액
            monthlyTrend,              // 월별 추이
            recentOutputs: formattedRecentOutputs, // 최근 출고 5건
            outputTop5: formattedTop5   // 출고 상위 5자재
        });

    } catch (error) {
        console.error("출고 통계 조회 오류:", error);
        res.status(500).json({ message: error.message || "출고 통계 조회 중 오류가 발생했습니다." });
    }
});





module.exports = router;
