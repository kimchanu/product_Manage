const sequelize = require("../db/sequelize");

async function main() {
  const businessLocation = process.argv[2] || "GK";
  const department = process.argv[3] || "ITS";
  const month = process.argv[4] || "2025-12";
  const start = `${month}-01`;
  const end = `${month}-31 23:59:59`;
  const locationVariants =
    businessLocation === "GK"
      ? ["GK", "GK사업소"]
      : businessLocation === "GK사업소"
      ? ["GK사업소", "GK"]
      : [businessLocation];

  try {
    const [apiRows] = await sequelize.query(
      `
      SELECT material_id, material_code, name, price, quantity, date
      FROM api_main_product
      WHERE business_location IN (:locationVariants)
        AND department = :department
        AND date BETWEEN :start AND :end
      ORDER BY date ASC
      `,
      {
        replacements: { locationVariants, department, start, end },
      }
    );

    const [inputRows] = await sequelize.query(
      `
      SELECT i.material_id, i.quantity, i.date, p.price, p.name
      FROM \`${businessLocation}_${department}_input\` i
      LEFT JOIN \`${businessLocation}_${department}_product\` p
        ON p.material_id = i.material_id
      WHERE i.date BETWEEN :start AND :end
      ORDER BY i.date ASC
      `,
      {
        replacements: { start, end },
      }
    ).catch((error) => {
      if (error.original && error.original.code === "ER_NO_SUCH_TABLE") {
        return [[]];
      }
      throw error;
    });

    const [outputRows] = await sequelize.query(
      `
      SELECT o.material_id, o.quantity, o.date, p.price, p.name
      FROM \`${businessLocation}_${department}_output\` o
      LEFT JOIN \`${businessLocation}_${department}_product\` p
        ON p.material_id = o.material_id
      WHERE o.date BETWEEN :start AND :end
      ORDER BY o.date ASC
      `,
      {
        replacements: { start, end },
      }
    ).catch((error) => {
      if (error.original && error.original.code === "ER_NO_SUCH_TABLE") {
        return [[]];
      }
      throw error;
    });

    const inputTotal =
      inputRows.reduce(
        (sum, row) => sum + Number(row.quantity || 0) * Number(row.price || 0),
        0
      ) +
      apiRows.reduce(
        (sum, row) => sum + Number(row.quantity || 0) * Number(row.price || 0),
        0
      );

    const outputTotal = outputRows.reduce(
      (sum, row) => sum + Number(row.quantity || 0) * Number(row.price || 0),
      0
    );

    console.log(
      JSON.stringify(
        {
          businessLocation,
          department,
          month,
          apiRows,
          inputRows,
          outputRows,
          inputTotal,
          outputTotal,
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
