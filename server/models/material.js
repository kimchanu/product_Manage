const { DataTypes } = require("sequelize");
const sequelize = require("../db2");

function createModels(businessLocation, department) {
  const prefix = `${businessLocation}_${department}`;

  // 이미 모델이 존재하면 재사용
  if (
    sequelize.models[`${prefix}_product`] &&
    sequelize.models[`${prefix}_input`] &&
    sequelize.models[`${prefix}_output`]
  ) {
    return {
      Product: sequelize.models[`${prefix}_product`],
      Input: sequelize.models[`${prefix}_input`],
      Output: sequelize.models[`${prefix}_output`],
    };
  }

  // Product 모델
  const Product = sequelize.define(
    `${prefix}_product`,
    {
      material_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      material_code: { type: DataTypes.STRING, allowNull: false, unique: true }, // 유니크 코드
      name: { type: DataTypes.STRING },
      location: { type: DataTypes.STRING },
      category: { type: DataTypes.STRING },
      sub_category: { type: DataTypes.STRING },
      specification: { type: DataTypes.STRING },
      manufacturer: { type: DataTypes.STRING },
      unit: { type: DataTypes.STRING },
      price: { type: DataTypes.INTEGER },
      big_category: { type: DataTypes.INTEGER },
      appropriate: { type: DataTypes.INTEGER },
    },
    { timestamps: false, freezeTableName: true }
  );

  // Input 모델
  const Input = sequelize.define(
    `${prefix}_input`,
    {
      material_id: { type: DataTypes.INTEGER },
      quantity: { type: DataTypes.INTEGER },
      comment: { type: DataTypes.TEXT },
      date: { type: DataTypes.DATE },
      department: { type: DataTypes.STRING },
      business_location: { type: DataTypes.STRING },
      user_id: { type: DataTypes.STRING },
    },
    { timestamps: false, freezeTableName: true }
  );

  // Output 모델
  const Output = sequelize.define(
    `${prefix}_output`,
    {
      material_id: { type: DataTypes.INTEGER },
      quantity: { type: DataTypes.INTEGER },
      comment: { type: DataTypes.TEXT },
      date: { type: DataTypes.DATE },
      department: { type: DataTypes.STRING },
      business_location: { type: DataTypes.STRING },
      user_id: { type: DataTypes.STRING },
    },
    { timestamps: false, freezeTableName: true }
  );

  // 관계 설정
  Product.hasMany(Input, { foreignKey: "material_id", as: "inputs" });
  Product.hasMany(Output, { foreignKey: "material_id", as: "outputs" });
  Input.belongsTo(Product, { foreignKey: "material_id", as: "product" });
  Output.belongsTo(Product, { foreignKey: "material_id", as: "product" });

  return { Product, Input, Output };
}

module.exports = { createModels };
