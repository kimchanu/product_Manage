const express = require("express");
const router = express.Router();
const { Sequelize } = require("sequelize");
const sequelize = require("../db/sequelize");

// 예산 모델 정의
const Budget = sequelize.define(
    "Budget",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        year: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        business_location: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        department: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        budget_amount: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        tableName: "budgets",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["business_location", "department", "year"],
            },
        ],
        underscored: true,
    }
);

// 예산 저장 API
router.post("/", async (req, res) => {
    const { year, budget } = req.body; // budget은 배열 [{ site, department, amount }]

    if (!year || !budget || !Array.isArray(budget)) {
        return res.status(400).json({
            message: "필수 정보가 누락되었거나 형식이 올바르지 않습니다.",
        });
    }

    try {
        const yearNum = Number(year);
        if (isNaN(yearNum)) {
            return res.status(400).json({ message: "연도는 숫자여야 합니다." });
        }

        await sequelize.transaction(async (t) => {
            // 해당 연도 기존 데이터 모두 삭제
            await Budget.destroy({ where: { year: yearNum }, transaction: t });

            // 새 예산 항목들을 삽입
            const insertPromises = budget.map(({ site, department, amount }) => {
                if (!site || !department || amount == null) {
                    throw new Error(
                        "예산 항목에 site, department, amount 필드가 모두 필요합니다."
                    );
                }

                return Budget.create(
                    {
                        year: yearNum,
                        business_location: site,
                        department,
                        budget_amount: amount,
                    },
                    { transaction: t }
                );
            });

            await Promise.all(insertPromises);
        });

        res.json({ message: "예산이 성공적으로 저장되었습니다." });
    } catch (err) {
        console.error("예산 저장 오류:", err);
        res.status(500).json({ message: "서버 오류", error: err.message });
    }
});

// 예산 조회 API
router.get("/", async (req, res) => {
    const { year } = req.query;

    if (!year) {
        return res.status(400).json({ message: "연도가 필요합니다." });
    }

    try {
        const yearNum = Number(year);
        if (isNaN(yearNum)) {
            return res.status(400).json({ message: "연도는 숫자여야 합니다." });
        }

        // 해당 연도 모든 예산 조회
        const budgets = await Budget.findAll({
            where: { year: yearNum },
            attributes: ["business_location", "department", "budget_amount"],
        });

        // 프론트가 기대하는 배열 형태로 변환
        const result = budgets.map((item) => ({
            site: item.business_location,
            department: item.department,
            amount: Number(item.budget_amount),
            year: yearNum,
        }));

        res.json({ year: yearNum, budget: result });
    } catch (err) {
        console.error("예산 조회 오류:", err);
        res.status(500).json({ message: "서버 오류", error: err.message });
    }
});

// 모든 예산 전체 조회 API
router.get("/all", async (req, res) => {
    try {
        const budgets = await Budget.findAll({});
        res.json(budgets); // 전체 row json 그대로 반환
    } catch (err) {
        console.error("모든 예산 조회 오류:", err);
        res.status(500).json({ message: "서버 오류", error: err.message });
    }
});

module.exports = router;
