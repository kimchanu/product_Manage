const sequelize = require("../db/sequelize");
const PredictionResult = require("../models/PredictionResultModel");

async function createPredictionTables() {
  try {
    await sequelize.authenticate();
    await PredictionResult.sync();
    console.log("prediction_result table is ready.");
  } catch (error) {
    console.error("Failed to create prediction tables:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

createPredictionTables();
