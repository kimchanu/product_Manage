const express = require("express");
const { Op, fn, col, literal } = require("sequelize");
const PredictionResult = require("../models/PredictionResultModel");
const { createModels, ApiMainProduct } = require("../models/material");

const router = express.Router();

const BUSINESS_LOCATIONS = [
  "GK",
  "천마사업소",
  "을숙도사업소",
  "강남사업소",
  "수원사업소",
];

const DEPARTMENTS = ["ITS", "기전", "시설"];

function normalizeMonth(value) {
  if (!value) return null;

  if (/^\d{4}-\d{2}$/.test(value)) {
    return `${value}-01`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value.slice(0, 7)}-01`;
  }

  return null;
}

function buildWhereClause(query) {
  const where = {};

  if (query.targetType) where.target_type = query.targetType;
  if (query.businessLocation) where.business_location = query.businessLocation;
  if (query.department) where.department = query.department;
  if (query.category) where.category = query.category;
  if (query.materialId) where.material_id = query.materialId;
  if (query.modelName) where.model_name = query.modelName;
  if (query.status) where.status = query.status;

  const fromMonth = normalizeMonth(query.fromMonth);
  const toMonth = normalizeMonth(query.toMonth);

  if (fromMonth || toMonth) {
    where.target_month = {};
    if (fromMonth) where.target_month[Op.gte] = fromMonth;
    if (toMonth) where.target_month[Op.lte] = toMonth;
  }

  return where;
}

function shiftMonth(dateString, offset) {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + offset);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-01`;
}

function getConfidenceLevel(dataMonths) {
  if (dataMonths >= 24) return "high";
  if (dataMonths >= 12) return "medium";
  return "low";
}

function getLocationVariants(businessLocation) {
  const variants = [businessLocation];

  if (businessLocation === "GK") variants.push("GK사업소");
  if (businessLocation === "GK사업소") variants.push("GK");

  return variants;
}

async function fetchHistoryData(businessLocation, department, monthsBack) {
  const safeMonthsBack = Math.min(Math.max(Number(monthsBack || 16), 1), 36);
  createModels(businessLocation, department);

  const startDate = new Date();
  startDate.setDate(1);
  startDate.setMonth(startDate.getMonth() - (safeMonthsBack - 1));
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1, 0);
  endDate.setHours(23, 59, 59, 999);

  const monthMap = new Map();
  const baseMonth = `${startDate.getFullYear()}-${String(
    startDate.getMonth() + 1
  ).padStart(2, "0")}-01`;

  for (let index = 0; index < safeMonthsBack; index += 1) {
    const monthKey = shiftMonth(baseMonth, index);
    monthMap.set(monthKey, {
      month: monthKey,
      inputAmount: 0,
      outputAmount: 0,
      inputCount: 0,
      outputCount: 0,
    });
  }

  const inputTable = `${businessLocation}_${department}_input`;
  const outputTable = `${businessLocation}_${department}_output`;
  const productTable = `${businessLocation}_${department}_product`;

  const [localInputs] = await ApiMainProduct.sequelize
    .query(
      `
      SELECT i.material_id, i.quantity, i.date, p.price
      FROM \`${inputTable}\` i
      LEFT JOIN \`${productTable}\` p
        ON p.material_id = i.material_id
      WHERE i.date BETWEEN :startDate AND :endDate
      ORDER BY i.date ASC
      `,
      {
        replacements: { startDate, endDate },
      }
    )
    .catch((error) => {
      if (error.original && error.original.code === "ER_NO_SUCH_TABLE") {
        return [[]];
      }
      throw error;
    });

  const [localOutputs] = await ApiMainProduct.sequelize
    .query(
      `
      SELECT o.material_id, o.quantity, o.date, p.price
      FROM \`${outputTable}\` o
      LEFT JOIN \`${productTable}\` p
        ON p.material_id = o.material_id
      WHERE o.date BETWEEN :startDate AND :endDate
      ORDER BY o.date ASC
      `,
      {
        replacements: { startDate, endDate },
      }
    )
    .catch((error) => {
      if (error.original && error.original.code === "ER_NO_SUCH_TABLE") {
        return [[]];
      }
      throw error;
    });

  const apiInputs = await ApiMainProduct.findAll({
    where: {
      business_location: {
        [Op.in]: getLocationVariants(businessLocation),
      },
      department,
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    attributes: ["quantity", "price", "date"],
    raw: true,
  }).catch(() => []);

  localInputs.forEach((item) => {
    const monthKey = normalizeMonth(new Date(item.date).toISOString().slice(0, 10));
    const target = monthMap.get(monthKey);
    if (!target) return;

    target.inputAmount +=
      Number(item.quantity || 0) * Number(item.price || 0);
    target.inputCount += 1;
  });

  localOutputs.forEach((item) => {
    const monthKey = normalizeMonth(new Date(item.date).toISOString().slice(0, 10));
    const target = monthMap.get(monthKey);
    if (!target) return;

    target.outputAmount +=
      Number(item.quantity || 0) * Number(item.price || 0);
    target.outputCount += 1;
  });

  apiInputs.forEach((item) => {
    const monthKey = normalizeMonth(new Date(item.date).toISOString().slice(0, 10));
    const target = monthMap.get(monthKey);
    if (!target) return;

    target.inputAmount += Number(item.quantity || 0) * Number(item.price || 0);
    target.inputCount += 1;
  });

  const history = Array.from(monthMap.values());
  const hasData = history.some(
    (item) =>
      item.inputAmount !== 0 ||
      item.outputAmount !== 0 ||
      item.inputCount !== 0 ||
      item.outputCount !== 0
  );

  return {
    businessLocation,
    department,
    monthsBack: safeMonthsBack,
    confidenceLevel: getConfidenceLevel(history.length),
    hasData,
    history,
  };
}

router.get("/material-usage", async (req, res) => {
  const { businessLocation, department } = req.query;
  const monthsBack = Math.min(Math.max(Number(req.query.monthsBack || 6), 1), 24);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);

  if (!businessLocation || !department) {
    return res.status(400).json({
      message: "businessLocation과 department가 필요합니다.",
    });
  }

  try {
    createModels(businessLocation, department);

    const startDate = new Date();
    startDate.setDate(1);
    startDate.setMonth(startDate.getMonth() - (monthsBack - 1));
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    const outputTable = `${businessLocation}_${department}_output`;
    const productTable = `${businessLocation}_${department}_product`;

    const [rows] = await ApiMainProduct.sequelize
      .query(
        `
        SELECT
          o.material_id,
          o.quantity,
          o.date,
          p.name,
          p.price,
          p.material_code
        FROM \`${outputTable}\` o
        LEFT JOIN \`${productTable}\` p
          ON p.material_id = o.material_id
        WHERE o.date BETWEEN :startDate AND :endDate
        ORDER BY o.date ASC
        `,
        {
          replacements: { startDate, endDate },
        }
      )
      .catch((error) => {
        if (error.original && error.original.code === "ER_NO_SUCH_TABLE") {
          return [[]];
        }
        throw error;
      });

    const materialMap = new Map();

    rows.forEach((row) => {
      const materialId = row.material_id;
      if (!materialId) return;

      const month = normalizeMonth(new Date(row.date).toISOString().slice(0, 10));
      const quantity = Number(row.quantity || 0);
      const price = Number(row.price || 0);

      if (!materialMap.has(materialId)) {
        materialMap.set(materialId, {
          materialId,
          materialName: row.name || null,
          materialCode: row.material_code || null,
          unitPrice: price,
          totalQuantity: 0,
          totalAmount: 0,
          monthly: {},
        });
      }

      const target = materialMap.get(materialId);
      target.totalQuantity += quantity;
      target.totalAmount += quantity * price;
      target.monthly[month] = (target.monthly[month] || 0) + quantity;
    });

    const materials = Array.from(materialMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);

    res.json({
      businessLocation,
      department,
      monthsBack,
      materials,
    });
  } catch (error) {
    console.error("Prediction material usage error:", error);
    res.status(500).json({
      message: "자재 사용 이력 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

router.post("/bulk", async (req, res) => {
  const { predictions } = req.body;

  if (!Array.isArray(predictions) || predictions.length === 0) {
    return res.status(400).json({
      message: "predictions 배열이 필요합니다.",
    });
  }

  try {
    const rows = predictions.map((item, index) => {
      const baseMonth = normalizeMonth(item.baseMonth);
      const targetMonth = normalizeMonth(item.targetMonth);

      if (
        !item.targetType ||
        !item.businessLocation ||
        !baseMonth ||
        !targetMonth ||
        item.predictedValue == null
      ) {
        throw new Error(`${index + 1}번째 예측 데이터에 필수값이 누락되었습니다.`);
      }

      return {
        target_type: item.targetType,
        business_location: item.businessLocation,
        department: item.department || null,
        category: item.category || null,
        material_id: item.materialId || null,
        base_month: baseMonth,
        target_month: targetMonth,
        predicted_value: Number(item.predictedValue),
        actual_value:
          item.actualValue == null ? null : Number(item.actualValue),
        confidence_level: item.confidenceLevel || "low",
        model_name: item.modelName || "baseline",
        data_months: Number(item.dataMonths || 0),
        status: item.status || "predicted",
        notes: item.notes || null,
      };
    });

    const duplicateConditions = rows.map((row) => ({
      target_type: row.target_type,
      business_location: row.business_location,
      department: row.department,
      category: row.category,
      material_id: row.material_id,
      target_month: row.target_month,
      model_name: row.model_name,
    }));

    if (duplicateConditions.length > 0) {
      await PredictionResult.destroy({
        where: {
          [Op.or]: duplicateConditions,
        },
      });
    }

    const created = await PredictionResult.bulkCreate(rows);

    res.status(201).json({
      message: "예측 결과가 저장되었습니다.",
      count: created.length,
    });
  } catch (error) {
    console.error("Prediction bulk save error:", error);
    res.status(500).json({
      message: "예측 결과 저장 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

router.get("/history", async (req, res) => {
  const { businessLocation, department } = req.query;
  const monthsBack = req.query.monthsBack || 16;

  if (!businessLocation || !department) {
    return res.status(400).json({
      message: "businessLocation과 department가 필요합니다.",
    });
  }

  try {
    const result = await fetchHistoryData(businessLocation, department, monthsBack);
    res.json(result);
  } catch (error) {
    console.error("Prediction history error:", error);
    res.status(500).json({
      message: "예측 이력 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

router.get("/coverage", async (req, res) => {
  const monthsBack = req.query.monthsBack || 16;

  try {
    const coverage = [];

    for (const businessLocation of BUSINESS_LOCATIONS) {
      for (const department of DEPARTMENTS) {
        const result = await fetchHistoryData(
          businessLocation,
          department,
          monthsBack
        );

        const activeMonths = result.history.filter(
          (item) =>
            item.inputAmount !== 0 ||
            item.outputAmount !== 0 ||
            item.inputCount !== 0 ||
            item.outputCount !== 0
        );

        coverage.push({
          businessLocation,
          department,
          hasData: result.hasData,
          activeMonths: activeMonths.length,
          latestActiveMonth:
            activeMonths.length > 0
              ? activeMonths[activeMonths.length - 1].month
              : null,
          inputTotal: activeMonths.reduce(
            (sum, item) => sum + Number(item.inputAmount || 0),
            0
          ),
          outputTotal: activeMonths.reduce(
            (sum, item) => sum + Number(item.outputAmount || 0),
            0
          ),
        });
      }
    }

    res.json({
      monthsBack: Number(monthsBack),
      coverage,
    });
  } catch (error) {
    console.error("Prediction coverage error:", error);
    res.status(500).json({
      message: "데이터 존재 현황 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const where = buildWhereClause(req.query);

    const predictions = await PredictionResult.findAll({
      where,
      order: [
        ["target_month", "DESC"],
        ["created_at", "DESC"],
      ],
      limit,
    });

    res.json(predictions);
  } catch (error) {
    console.error("Prediction list error:", error);
    res.status(500).json({
      message: "예측 결과 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const where = buildWhereClause(req.query);

    const summary = await PredictionResult.findAll({
      where,
      attributes: [
        "target_type",
        "business_location",
        "department",
        "target_month",
        [fn("COUNT", col("id")), "prediction_count"],
        [fn("SUM", col("predicted_value")), "predicted_total"],
        [fn("SUM", col("actual_value")), "actual_total"],
        [fn("AVG", col("data_months")), "avg_data_months"],
        [
          fn(
            "SUM",
            literal("CASE WHEN confidence_level = 'high' THEN 1 ELSE 0 END")
          ),
          "high_confidence_count",
        ],
      ],
      group: [
        "target_type",
        "business_location",
        "department",
        "target_month",
      ],
      order: [["target_month", "DESC"]],
    });

    res.json(summary);
  } catch (error) {
    console.error("Prediction summary error:", error);
    res.status(500).json({
      message: "예측 요약 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

router.patch("/:id/actual", async (req, res) => {
  const { id } = req.params;
  const { actualValue, notes } = req.body;

  if (actualValue == null) {
    return res.status(400).json({
      message: "actualValue 값이 필요합니다.",
    });
  }

  try {
    const prediction = await PredictionResult.findByPk(id);

    if (!prediction) {
      return res.status(404).json({
        message: "예측 결과를 찾을 수 없습니다.",
      });
    }

    prediction.actual_value = Number(actualValue);
    prediction.status = "confirmed";
    prediction.notes = notes ?? prediction.notes;

    await prediction.save();

    res.json({
      message: "실제값이 반영되었습니다.",
      prediction,
    });
  } catch (error) {
    console.error("Prediction actual update error:", error);
    res.status(500).json({
      message: "실제값 반영 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
