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
      material_id: { type: DataTypes.STRING(50), primaryKey: true }, // UUID로 사용
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
      material_id: { type: DataTypes.STRING(50) },
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
      material_id: { type: DataTypes.STRING(50) },
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

// ApiMainProduct 모델 (Groupware 연동 테이블 - 정적 테이블)
// 이미 정의되어 있으면 재사용
const ApiMainProduct = sequelize.define(
  "api_main_product",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    business_location: { type: DataTypes.STRING },
    department: { type: DataTypes.STRING },
    user_id: { type: DataTypes.STRING },
    material_id: { type: DataTypes.STRING(50) },
    material_code: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    big_category: { type: DataTypes.STRING }, // 스키마에서 문자열로 확인됨 (schema.txt: "1")
    category: { type: DataTypes.STRING },
    sub_category: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    specification: { type: DataTypes.STRING },
    manufacturer: { type: DataTypes.STRING },
    supplier: { type: DataTypes.STRING },
    unit: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER }, // 초기 재고/입고 수량 역할
    date: { type: DataTypes.DATE },
    comment: { type: DataTypes.TEXT },
  },
  { timestamps: false, freezeTableName: true, tableName: "api_main_product" }
);

module.exports = { createModels, ApiMainProduct };
