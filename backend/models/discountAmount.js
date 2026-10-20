'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DiscountAmount extends Model {}

    DiscountAmount.init({
        code: { type: DataTypes.STRING, allowNull: false, unique: true },
        percentage: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        amount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        expiresAt: { type: DataTypes.DATE, allowNull: true }
    }, {
        sequelize,
        modelName: 'DiscountAmount',
        tableName: 'discount_amounts',
        timestamps: true
    });

    return DiscountAmount;
};
