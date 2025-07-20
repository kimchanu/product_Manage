const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const OutputRequest = sequelize.define('OutputRequest', {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        material_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        request_qty: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        requester_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        request_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        comment: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        department: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        business_location: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('대기', '승인', '반려'),
            allowNull: false,
            defaultValue: '대기',
        },
        approver_id: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        approve_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        reject_reason: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'output_request',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return OutputRequest;
}; 