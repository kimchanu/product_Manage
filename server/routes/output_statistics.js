const express = require("express");
const router = express.Router();
const { createModels } = require("../models/material");
const createOutputModel = require('../models/OutputModel');
const { Op } = require('sequelize');
const sequelize = require('../db/sequelize');

router.post("/", async (req, res) => {
    const { businessLocation, department, year, month, includeAllOutputs = false } = req.body;
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


        // 🔹 1. Local Data 조회 및 초기화
        let allProducts = [];
        let cumulativeOutputs = [];
        let monthlyOutputs = [];
        let recentOutputs = [];
        let allOutputsRaw = [];

        try {
            // 모든 자재 정보 조회
            allProducts = await Product.findAll({
                attributes: ['material_id', 'price', 'name', 'material_code', 'specification'],
                raw: true
            });

            // 🔹 누적 출고 데이터 조회 (해당 월까지의 데이터)
            const cumulativeEndDate = new Date(year, month, 0);
            cumulativeEndDate.setHours(23, 59, 59, 999);

            console.log(`누적 계산 종료일: ${cumulativeEndDate.toISOString()}`);

            // 디버깅용 로그 (생략 가능하지만 유지)
            // const allOutputsDebug = ...

            cumulativeOutputs = await Output.findAll({
                where: {
                    date: {
                        [Op.lte]: cumulativeEndDate
                    }
                },
                order: [['date', 'ASC']],
                attributes: ['quantity', 'date', 'material_id'],
                raw: true
            });

            // 🔸 월 출고 금액 계산 (선택 월만)
            monthlyOutputs = await Output.findAll({
                where: {
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                attributes: ['quantity', 'date', 'material_id', 'user_id'],
                raw: true
            });

            // 🔸 최근 출고 내역 (선택 월 기준 상위 5건)
            recentOutputs = await Output.findAll({
                where: {
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                limit: 5,
                order: [['date', 'DESC']],
                attributes: ['quantity', 'date', 'material_id', 'user_id'],
                raw: true
            });

            if (includeAllOutputs) {
                allOutputsRaw = await Output.findAll({
                    where: {
                        date: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    order: [['date', 'DESC']],
                    attributes: ['quantity', 'date', 'material_id', 'user_id'],
                    raw: true
                });
            }

        } catch (error) {
            if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
                console.warn(`⚠️ 테이블이 존재하지 않음 (${department}), Local 데이터 없이 진행`);
                // 빈 배열 유지
            } else {
                throw error;
            }
        }

        const { ApiMainProduct } = require("../models/material"); // Ensure this is imported if not already, or use the one I will add at top

        const locationMapping = {
            "GK": "GK사업소"
        };
        const locationName = locationMapping[businessLocation] || businessLocation;

        let apiProducts = [];
        try {
            apiProducts = await ApiMainProduct.findAll({
                attributes: ['material_id', 'price', 'name', 'material_code', 'specification'],
                where: {
                    business_location: {
                        [Op.or]: [businessLocation, locationName]
                    },
                    department: department
                },
                raw: true
            });
        } catch (error) {
            console.warn("ApiMainProduct 조회 실패 (무시됨):", error.message);
        }

        const productMap = new Map();

        // 1. ApiMainProduct 데이터로 초기화
        apiProducts.forEach(p => productMap.set(p.material_id, p));

        // 2. Local Product 데이터로 덮어쓰기 (Local 우선)
        allProducts.forEach(p => productMap.set(p.material_id, p));

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

                let monthOutputs = [];
                try {
                    monthOutputs = await Output.findAll({
                        where: {
                            date: {
                                [Op.between]: [monthStart, monthEnd]
                            }
                        },
                        attributes: ['quantity', 'material_id'],
                        raw: true
                    });
                } catch (error) {
                    if (!(error.original && error.original.code === 'ER_NO_SUCH_TABLE')) {
                        console.error('월별 추이 조회 중 에러 (무시됨):', error.message);
                    }
                }

                const monthAmount = monthOutputs.reduce((sum, output) => {
                    const product = productMap.get(output.material_id);
                    return sum + (output.quantity * (product?.price || 0));
                }, 0);

                return monthAmount;
            })
        );

        const formattedRecentOutputs = recentOutputs.map(output => {
            const product = productMap.get(output.material_id) || {};
            const price = product.price || 0;
            return {
                name: product.name || 'Unknown',
                material_code: product.material_code || null,
                specification: product.specification || null,
                price,
                quantity: output.quantity,
                amount: output.quantity * price,
                date: output.date,
                user_id: output.user_id || null
            };
        });

        let allOutputs = undefined;
        if (includeAllOutputs) {
            allOutputs = allOutputsRaw.map(output => {
                const product = productMap.get(output.material_id) || {};
                const price = product.price || 0;
                return {
                    name: product.name || 'Unknown',
                    material_code: product.material_code || null,
                    specification: product.specification || null,
                    price,
                    quantity: output.quantity,
                    amount: output.quantity * price,
                    date: output.date,
                    user_id: output.user_id || null
                };
            });
        }

        // ✅ 최종 응답
        res.json({
            totalOutputAmount,           // 전체 누적 출고 금액
            cumulativeOutputList,       // 전체 누적 출고 리스트
            monthlyOutputAmount,        // 월 출고 금액
            monthlyTrend,              // 월별 추이
            recentOutputs: formattedRecentOutputs, // 최근 출고 5건
            totalOutputsCount: monthlyOutputs.length,
            allOutputs: includeAllOutputs ? allOutputs : undefined
        });

    } catch (error) {
        console.error("출고 통계 조회 오류:", error);
        res.status(500).json({ message: error.message || "출고 통계 조회 중 오류가 발생했습니다." });
    }
});

module.exports = router;
