const express = require("express");
const router = express.Router();
const { createModels } = require("../models/material");
const createInputModel = require('../models/InputModel');
const createOutputModel = require('../models/OutputModel');
const { Op } = require('sequelize');
const sequelize = require('../db/sequelize');

router.post("/", async (req, res) => {
    const { businessLocation, department, year, month } = req.body;

    if (!businessLocation || !department || !year || !month) {
        return res.status(400).json({ error: "사업소, 부서, 연도, 월을 모두 입력하세요." });
    }

    try {
        // console.log(`[요청] 사업소: ${businessLocation}, 부서: ${department}, 연도: ${year}, 월: ${month}`);

        const { Product, Output } = createModels(businessLocation, department);
        const products = await Product.findAll({
            include: [
                {
                    model: Output,
                    as: "outputs",
                    attributes: ["quantity", "date"],
                },
            ],
        });

        let totalOutputAmount = 0;
        let monthlyOutputAmount = 0;
        const recentOutputs = [];

        // ✅ 월별 출고 금액 (index 0 = 1월, index 11 = 12월)
        const monthlyTrend = Array(12).fill(0);

        for (const product of products) {
            const outputs = product.outputs || [];

            for (const out of outputs) {
                const price = product.price || 0;
                const quantity = out.quantity || 0;
                const outDate = new Date(out.date);

                totalOutputAmount += quantity * price;

                const outputYear = outDate.getFullYear();
                const outputMonth = outDate.getMonth(); // 0~11

                // ✅ 월별 출고금액 누적
                if (outputYear === parseInt(year)) {
                    monthlyTrend[outputMonth] += quantity * price;
                }

                // 현재 선택한 월의 출고 금액 누적
                if (
                    outputYear === parseInt(year) &&
                    outputMonth + 1 === parseInt(month)
                ) {
                    monthlyOutputAmount += quantity * price;
                }

                recentOutputs.push({
                    material_code: product.material_code,
                    name: product.name,
                    quantity: quantity,
                    date: out.date,
                });
            }
        }

        recentOutputs.sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestFive = recentOutputs.slice(0, 5);

        const materialOutputMap = {};
        for (const item of recentOutputs) {
            const key = `${item.material_code}|${item.name}`;
            if (!materialOutputMap[key]) {
                materialOutputMap[key] = 0;
            }
            materialOutputMap[key] += item.quantity;
        }

        const outputTop5 = Object.entries(materialOutputMap)
            .map(([key, qty]) => {
                const [material_code, name] = key.split("|");
                return { material_code, name, total: qty };
            })
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        // ✅ 로그 출력
        // console.log("📦 총 출고금액:", totalOutputAmount);
        // console.log("📅 월 출고금액:", monthlyOutputAmount);
        // console.log("📊 월별 추이:", monthlyTrend);
        // console.log("🕓 최근 출고 5건:", latestFive);
        // console.log("🏆 출고 상위 5자재:", outputTop5);

        res.json({
            totalOutputAmount,
            monthlyOutputAmount,
            monthlyTrend, // ✅ 추가된 필드
            recentOutputs: latestFive,
            outputTop5,
        });
    } catch (error) {
        console.error("통계 API 오류:", error);
        res.status(500).json({ error: "통계 정보를 불러오는 중 오류 발생" });
    }
});

// 입고 통계 조회
router.post("/input", async (req, res) => {
    const { businessLocation, department, year, month } = req.body;

    if (!businessLocation || !department || !year || !month) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
    }

    try {
        // console.log(`[입고 통계 요청] 사업소: ${businessLocation}, 부서: ${department}, 연도: ${year}, 월: ${month}`);

        let Input, Product;

        try {
            Input = createInputModel(businessLocation, department);
            const models = createModels(businessLocation, department);
            Product = models.Product;
        } catch (modelError) {
            console.error("모델 생성 오류:", modelError);
            // 테이블이 존재하지 않거나 모델 생성에 실패한 경우 빈 데이터 반환
            return res.json({
                totalInputAmount: 0,
                monthlyInputAmount: 0,
                monthlyTrend: Array(12).fill(0),
                recentInputs: [],
                inputTop5: []
            });
        }

        if (!Product) {
            console.log("Product 모델을 찾을 수 없습니다.");
            return res.json({
                totalInputAmount: 0,
                monthlyInputAmount: 0,
                monthlyTrend: Array(12).fill(0),
                recentInputs: [],
                inputTop5: []
            });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // 총 입고 금액 (전체 기간)
        const totalInputs = await Input.findAll({
            attributes: ['quantity', 'date', 'material_id'],
            raw: true
        });

        // 자재 정보 조회
        const materialIds = [...new Set(totalInputs.map(input => input.material_id))];
        const products = await Product.findAll({
            where: { material_id: materialIds },
            attributes: ['material_id', 'price', 'name'],
            raw: true
        });

        // 자재 정보를 Map으로 변환
        const productMap = new Map(products.map(p => [p.material_id, p]));

        const totalInputAmount = totalInputs.reduce((sum, input) => {
            const product = productMap.get(input.material_id);
            return sum + (input.quantity * (product?.price || 0));
        }, 0);

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

        // 월별 추이
        const monthlyTrend = await Promise.all(
            Array.from({ length: 12 }, (_, i) => i + 1).map(async (m) => {
                const monthStart = new Date(year, m - 1, 1);
                const monthEnd = new Date(year, m, 0);
                const monthInputs = await Input.findAll({
                    where: {
                        date: {
                            [Op.between]: [monthStart, monthEnd]
                        }
                    },
                    attributes: ['quantity', 'material_id'],
                    raw: true
                });

                return monthInputs.reduce((sum, input) => {
                    const product = productMap.get(input.material_id);
                    return sum + (input.quantity * (product?.price || 0));
                }, 0);
            })
        );

        // 최근 입고 내역
        const recentInputs = await Input.findAll({
            limit: 5,
            order: [['date', 'DESC']],
            attributes: ['quantity', 'date', 'material_id'],
            raw: true
        });

        // 입고 상위 자재
        const inputTop5 = await Input.findAll({
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
        // 테이블이 존재하지 않거나 기타 오류 발생 시 빈 데이터 반환
        res.json({
            totalInputAmount: 0,
            monthlyInputAmount: 0,
            monthlyTrend: Array(12).fill(0),
            recentInputs: [],
            inputTop5: []
        });
    }
});

// 출고 통계 조회
router.post("/output", async (req, res) => {
    const { businessLocation, department, year, month } = req.body;

    if (!businessLocation || !department || !year || !month) {
        return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
    }

    try {
        console.log(`[출고 통계 요청] 사업소: ${businessLocation}, 부서: ${department}, 연도: ${year}, 월: ${month}`);

        let Output, Material;

        try {
            Output = createOutputModel(businessLocation, department);
            const models = createModels(businessLocation, department);
            Material = models.Material;
        } catch (modelError) {
            console.error("모델 생성 오류:", modelError);
            // 테이블이 존재하지 않거나 모델 생성에 실패한 경우 빈 데이터 반환
            return res.json({
                totalOutputAmount: 0,
                monthlyOutputAmount: 0,
                monthlyTrend: Array(12).fill(0),
                recentOutputs: [],
                outputTop5: []
            });
        }

        if (!Material) {
            console.log("Material 모델을 찾을 수 없습니다.");
            return res.json({
                totalOutputAmount: 0,
                monthlyOutputAmount: 0,
                monthlyTrend: Array(12).fill(0),
                recentOutputs: [],
                outputTop5: []
            });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // 총 출고 금액 (전체 기간)
        const totalOutputs = await Output.findAll({
            attributes: ['quantity', 'date', 'material_id'],
            raw: true
        });

        // 자재 정보 조회
        const materialIds = [...new Set(totalOutputs.map(output => output.material_id))];
        const materials = await Material.findAll({
            where: { material_id: materialIds },
            attributes: ['material_id', 'price', 'name'],
            raw: true
        });

        // 자재 정보를 Map으로 변환
        const materialMap = new Map(materials.map(m => [m.material_id, m]));

        const totalOutputAmount = totalOutputs.reduce((sum, output) => {
            const material = materialMap.get(output.material_id);
            return sum + (output.quantity * (material?.price || 0));
        }, 0);

        // 월 출고 금액
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
            const material = materialMap.get(output.material_id);
            return sum + (output.quantity * (material?.price || 0));
        }, 0);

        // 월별 추이
        const monthlyTrend = await Promise.all(
            Array.from({ length: 12 }, (_, i) => i + 1).map(async (m) => {
                const monthStart = new Date(year, m - 1, 1);
                const monthEnd = new Date(year, m, 0);
                const monthOutputs = await Output.findAll({
                    where: {
                        date: {
                            [Op.between]: [monthStart, monthEnd]
                        }
                    },
                    attributes: ['quantity', 'material_id'],
                    raw: true
                });

                return monthOutputs.reduce((sum, output) => {
                    const material = materialMap.get(output.material_id);
                    return sum + (output.quantity * (material?.price || 0));
                }, 0);
            })
        );

        // 최근 출고 내역
        const recentOutputs = await Output.findAll({
            limit: 5,
            order: [['date', 'DESC']],
            attributes: ['quantity', 'date', 'material_id'],
            raw: true
        });

        // 출고 상위 자재
        const outputTop5 = await Output.findAll({
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
            totalOutputAmount,
            monthlyOutputAmount,
            monthlyTrend,
            recentOutputs: recentOutputs.map(output => ({
                name: materialMap.get(output.material_id)?.name || 'Unknown',
                quantity: output.quantity,
                date: output.date
            })),
            outputTop5: outputTop5.map(item => ({
                name: materialMap.get(item.material_id)?.name || 'Unknown',
                totalQuantity: item.totalQuantity
            }))
        });
    } catch (error) {
        console.error("출고 통계 조회 오류:", error);
        // 테이블이 존재하지 않거나 기타 오류 발생 시 빈 데이터 반환
        res.json({
            totalOutputAmount: 0,
            monthlyOutputAmount: 0,
            monthlyTrend: Array(12).fill(0),
            recentOutputs: [],
            outputTop5: []
        });
    }
});

module.exports = router;
