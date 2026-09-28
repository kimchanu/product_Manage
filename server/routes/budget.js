const express = require("express");
const router = express.Router();
const { Sequelize } = require("sequelize");
const sequelize = require("../db/sequelize");
const authMiddleware = require('../middleware/authMiddleware');
const { normalizeBudgetSite, budgetYear, validateBudget, fail } = require('../services/budgetValidation');

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
        var_budget_amount: {
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
router.post("/", authMiddleware, async (req, res) => {
    if (!(Number(req.user.admin || 0) >= 1)) return res.status(403).json({ message: '예산 저장은 관리자만 가능합니다.' });
    try {
        const { year, budget } = validateBudget(req.body);
        await sequelize.transaction(async (t) => {
            const current = await Budget.findAll({ where: { year }, transaction: t, lock: t.LOCK.UPDATE });
            for (const item of budget) {
                const matches = current.filter((row) => normalizeBudgetSite(row.business_location) === item.site && row.department === item.department);
                if (matches.length > 1) fail(`${item.site} ${item.department}에 중복 예산이 있습니다.`, 409);
                const existing = matches[0];
                if (item.hasExpected && (existing ? Number(existing.budget_amount) : null) !== item.expectedAmount) {
                    fail(`${item.site} ${item.department} 예산이 다른 작업에서 변경되었습니다. 새로고침 후 확인해 주세요.`, 409);
                }
                await Budget.upsert({ ...(existing ? { id: existing.id } : {}), year,
                    business_location: existing?.business_location || item.site, department: item.department,
                    budget_amount: item.amount, var_budget_amount: item.amount }, { transaction: t });
            }
        });
        res.json({ message: '예산이 저장되었습니다.', year, budget: budget.map(({ site, department, amount }) => ({ site, department, amount, year })) });
    } catch (err) {
        console.error("예산 저장 오류:", err);
        res.status(err.status || 500).json({ message: err.status ? err.message : '예산을 저장하지 못했습니다. 다시 시도해 주세요.' });
    }
});

// 예산 조회 API
router.get("/", async (req, res) => {
    const { year } = req.query;

    if (!year) {
        return res.status(400).json({ message: "연도가 필요합니다." });
    }

    try {
        const yearNum = budgetYear(year);

        // 해당 연도 모든 예산 조회
        const budgets = await Budget.findAll({
            where: { year: yearNum },
            attributes: ["business_location", "department", "budget_amount"],
        });

        // 프론트가 기대하는 배열 형태로 변환
        const result = budgets.map((item) => ({
            site: normalizeBudgetSite(item.business_location),
            department: item.department,
            amount: Number(item.budget_amount),
            year: yearNum,
        }));

        res.json({ year: yearNum, budget: result });
    } catch (err) {
        console.error("예산 조회 오류:", err);
        res.status(err.status || 500).json({ message: err.status ? err.message : '예산을 불러오지 못했습니다.' });
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
