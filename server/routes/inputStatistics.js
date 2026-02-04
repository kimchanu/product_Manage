const express = require("express");
const router = express.Router();
const { createModels, ApiMainProduct } = require("../models/material");
const { Op } = require('sequelize');
const sequelize = require('../db2');

router.post("/", async (req, res) => {

    const { businessLocation, department, year, month, includeAllInputs = false } = req.body;
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

        // 🟢 1. Local Data 조회 (예외 처리 추가)
        let allProducts = [];
        let cumulativeInputs = [];
        let monthlyInputs = [];
        let recentInputs = [];
        let allInputsRaw = [];

        try {
            // 모든 자재 정보 조회
            allProducts = await Product.findAll({
                attributes: ['material_id', 'price', 'name', 'material_code', 'specification'],
                raw: true
            });

            // 🔹 누적 입고 데이터 조회 (해당 월까지의 데이터)
            const cumulativeEndDate = new Date(year, month, 0); // 해당 월의 마지막 날
            cumulativeEndDate.setHours(23, 59, 59, 999);

            cumulativeInputs = await Input.findAll({
                where: {
                    date: {
                        [Op.lte]: cumulativeEndDate
                    }
                },
                order: [['date', 'ASC']],
                attributes: ['quantity', 'date', 'material_id'],
                raw: true
            });

            // 🔸 월 입고 금액 계산 (선택 월만)
            monthlyInputs = await Input.findAll({
                where: {
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                attributes: ['quantity', 'date', 'material_id', 'user_id'],
                raw: true
            });

            // 🔸 최근 입고 내역 (선택 월 기준 상위 5건)
            recentInputs = await Input.findAll({
                where: {
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                attributes: ['quantity', 'date', 'material_id', 'user_id'],
                raw: true
            });

            if (includeAllInputs) {
                allInputsRaw = await Input.findAll({
                    where: {
                        date: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    attributes: ['quantity', 'date', 'material_id', 'user_id'],
                    raw: true
                });
            }

        } catch (error) {
            if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
                console.warn(`⚠️ 테이블이 존재하지 않음 (${department}), Local 데이터 없이 진행`);
                // Local 데이터는 빈 배열로 유지, 계속 진행하여 ApiMainProduct 데이터 반환
            } else {
                throw error; // 다른 에러는 throw
            }
        }

        const productMap = new Map(allProducts.map(p => [p.material_id, p]));

        // 🔹 ApiMainProduct 데이터 조회 (정적 테이블 - 항상 존재한다고 가정)
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

        const cumulativeEndDate = new Date(year, month, 0);
        cumulativeEndDate.setHours(23, 59, 59, 999);

        const cumulativeApiInputs = apiMainProducts.filter(p => {
            const pDate = new Date(p.date);
            return pDate <= cumulativeEndDate;
        });

        // 🔹 누적 입고 금액 계산 (해당 월까지)
        const totalInputAmount = cumulativeInputs.reduce((sum, input) => {
            const product = productMap.get(input.material_id);
            const itemAmount = input.quantity * (product?.price || 0);
            return sum + itemAmount;
        }, 0) + cumulativeApiInputs.reduce((sum, input) => {
            return sum + (input.quantity * (input.price || 0));
        }, 0);

        console.log(`총 입고 건수: ${cumulativeInputs.length + cumulativeApiInputs.length}, 누적 입고 금액: ${totalInputAmount}`);

        const monthlyApiInputs = apiMainProducts.filter(p => {
            const pDate = new Date(p.date);
            return pDate >= startDate && pDate <= endDate;
        });

        const monthlyInputAmount = monthlyInputs.reduce((sum, input) => {
            const product = productMap.get(input.material_id);
            const itemAmount = input.quantity * (product?.price || 0);
            return sum + itemAmount;
        }, 0) + monthlyApiInputs.reduce((sum, input) => {
            return sum + (input.quantity * (input.price || 0));
        }, 0);

        console.log(`월 입고 금액: ${monthlyInputAmount}`);

        // 🔸 월별 추이 계산 (1~12월)
        const monthlyTrend = await Promise.all(
            Array.from({ length: 12 }, (_, i) => i + 1).map(async (m) => {
                const monthStart = new Date(year, m - 1, 1);
                const monthEnd = new Date(year, m, 0);
                monthEnd.setHours(23, 59, 59, 999);

                // Local Data for specific month (Check if table exists handled by try-catch above? No, this is new query)
                // Need to handle table missing here too.
                let monthInputs = [];
                try {
                    monthInputs = await Input.findAll({
                        where: {
                            date: {
                                [Op.between]: [monthStart, monthEnd]
                            }
                        },
                        attributes: ['quantity', 'material_id'],
                        raw: true
                    });
                } catch (error) {
                    // Ignore missing table error here as well
                    if (!(error.original && error.original.code === 'ER_NO_SUCH_TABLE')) {
                        console.error('월별 추이 조회 중 에러 (무시됨):', error.message);
                    }
                }

                const monthApiInputs = apiMainProducts.filter(p => {
                    const pDate = new Date(p.date);
                    return pDate >= monthStart && pDate <= monthEnd;
                });

                const monthAmount = monthInputs.reduce((sum, input) => {
                    const product = productMap.get(input.material_id);
                    return sum + (input.quantity * (product?.price || 0));
                }, 0) + monthApiInputs.reduce((sum, input) => {
                    return sum + (input.quantity * (input.price || 0));
                }, 0);

                return monthAmount;
            })
        );

        const formattedRecentInputs = recentInputs.map(input => {
            const product = productMap.get(input.material_id) || {};
            const price = product.price || 0;
            return {
                name: product.name || 'Unknown',
                material_code: product.material_code || null,
                specification: product.specification || null,
                price,
                quantity: input.quantity,
                amount: input.quantity * price,
                date: input.date,
                user_id: input.user_id || null,
                source: 'Input'
            };
        });

        const formattedApiInputs = monthlyApiInputs.map(input => {
            return {
                name: input.name || 'Unknown',
                material_code: input.material_code || null,
                specification: input.specification || null,
                price: input.price || 0,
                quantity: input.quantity,
                amount: input.quantity * (input.price || 0),
                date: input.date,
                user_id: input.user_id || null,
                source: 'ApiMainProduct'
            };
        });

        // 두 소스 병합 후 날짜 역순 정렬 
        const allRecentList = [...formattedRecentInputs, ...formattedApiInputs].sort((a, b) => new Date(b.date) - new Date(a.date));
        const finalRecentInputs = allRecentList.slice(0, 5);


        let allInputs = undefined;
        if (includeAllInputs) {
            const formattedAllInputs = allInputsRaw.map(input => {
                const product = productMap.get(input.material_id) || {};
                const price = product.price || 0;
                return {
                    name: product.name || 'Unknown',
                    material_code: product.material_code || null,
                    specification: product.specification || null,
                    price,
                    quantity: input.quantity,
                    amount: input.quantity * price,
                    date: input.date,
                    user_id: input.user_id || null,
                    source: 'Input'
                };
            });

            const formattedAllApiInputs = monthlyApiInputs.map(input => {
                return {
                    name: input.name || 'Unknown',
                    material_code: input.material_code || null,
                    specification: input.specification || null,
                    price: input.price || 0,
                    quantity: input.quantity,
                    amount: input.quantity * (input.price || 0),
                    date: input.date,
                    user_id: input.user_id || null,
                    source: 'ApiMainProduct'
                };
            });

            allInputs = [...formattedAllInputs, ...formattedAllApiInputs].sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        // ✅ 최종 응답
        res.json({
            totalInputAmount,           // 전체 누적 입고 금액
            monthlyInputAmount,        // 월 입고 금액
            monthlyTrend,              // 월별 추이
            recentInputs: finalRecentInputs, // 최근 입고 5건
            totalInputsCount: (monthlyInputs.length + monthlyApiInputs.length),
            allInputs: includeAllInputs ? allInputs : undefined
        });

    } catch (error) {
        console.error("입고 통계 조회 오류:", error);
        res.status(500).json({ message: error.message || "입고 통계 조회 중 오류가 발생했습니다." });
    }
});

module.exports = router;
