const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

function createInputModel(businessLocation, department) {
    const modelName = `${businessLocation.toLowerCase()}_${department.toLowerCase()}_input`;

    // 이미 존재하는 모델이면 재사용
    if (sequelize.models[modelName]) {
        return sequelize.models[modelName];
    }

    const Input = sequelize.define(modelName, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        material_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        comment: {
            type: DataTypes.STRING,
            allowNull: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        department: {
            type: DataTypes.STRING,
            allowNull: false
        },
        business_location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: modelName
    });

    return Input;
}

module.exports = createInputModel; 