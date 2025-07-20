const { DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");
const createInputModel = require('./InputModel');
const createOutputModel = require('./OutputModel');

function createStatementModels(businessLocation, department) {
    const modelName = `${businessLocation.toLowerCase()}_${department.toLowerCase()}_product`;

    // 이미 존재하는 모델이면 재사용
    if (sequelize.models[modelName]) {
        return {
            Product: sequelize.models[modelName],
            Input: createInputModel(businessLocation, department),
            Output: createOutputModel(businessLocation, department)
        };
    }

    const Product = sequelize.define(modelName, {
        material_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        material_code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        specification: {
            type: DataTypes.STRING,
            allowNull: true
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true
        },
        sub_category: {
            type: DataTypes.STRING,
            allowNull: true
        },
        department: {
            type: DataTypes.STRING,
            allowNull: false
        },
        business_location: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: modelName
    });

    const Input = createInputModel(businessLocation, department);
    const Output = createOutputModel(businessLocation, department);

    // statement.js를 위한 별도의 관계 설정
    Product.hasMany(Input, { foreignKey: 'material_id', as: 'inputs' });
    Input.belongsTo(Product, { foreignKey: 'material_id', as: 'gk_its_product' });

    Product.hasMany(Output, { foreignKey: 'material_id', as: 'outputs' });
    Output.belongsTo(Product, { foreignKey: 'material_id', as: 'gk_its_product' });

    return {
        Product,
        Input,
        Output
    };
}

module.exports = { createStatementModels }; 