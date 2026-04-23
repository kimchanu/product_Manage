const { DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

const PredictionResult = sequelize.define(
  "prediction_result",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    target_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    business_location: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    material_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    base_month: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    target_month: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    predicted_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    actual_value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    confidence_level: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "low",
    },
    model_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "baseline",
    },
    data_months: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("predicted", "confirmed"),
      allowNull: false,
      defaultValue: "predicted",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "prediction_result",
    freezeTableName: true,
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: "idx_prediction_result_lookup",
        fields: ["target_type", "business_location", "department", "target_month"],
      },
      {
        name: "idx_prediction_result_material",
        fields: ["material_id", "target_month"],
      },
    ],
  }
);

module.exports = PredictionResult;
