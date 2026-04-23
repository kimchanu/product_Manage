const sequelize = require("../db2");

async function main() {
  const businessLocation = process.argv[2] || "GK";
  const department = process.argv[3] || "ITS";
  const monthsBack = Math.min(Math.max(Number(process.argv[4] || 16), 1), 36);

  const startDate = new Date();
  startDate.setDate(1);
  startDate.setMonth(startDate.getMonth() - (monthsBack - 1));
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1, 0);
  endDate.setHours(23, 59, 59, 999);

  const inputTable = `${businessLocation}_${department}_input`;
  const outputTable = `${businessLocation}_${department}_output`;
  const productTable = `${businessLocation}_${department}_product`;

  try {
    const [localInputs] = await sequelize.query(
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
    );

    const [localOutputs] = await sequelize.query(
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
    );

    console.log(
      JSON.stringify(
        {
          businessLocation,
          department,
          startDate,
          endDate,
          inputCount: localInputs.length,
          outputCount: localOutputs.length,
          inputTotal: localInputs.reduce(
            (sum, row) => sum + Number(row.quantity || 0) * Number(row.price || 0),
            0
          ),
          outputTotal: localOutputs.reduce(
            (sum, row) => sum + Number(row.quantity || 0) * Number(row.price || 0),
            0
          ),
        },
        null,
        2
      )
    );
  } finally {
    await sequelize.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
