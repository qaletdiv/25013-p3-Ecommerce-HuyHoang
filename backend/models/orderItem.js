'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class OrderItem extends Model {
        static associate(models) {
            OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
            OrderItem.belongsTo(models.Variant, { foreignKey: 'variantId', as: 'variant' });
        }
    }

    OrderItem.init({
        orderId: { type: DataTypes.INTEGER, allowNull: false },
        variantId: { type: DataTypes.INTEGER, allowNull: false },
        productName: { type: DataTypes.STRING, allowNull: false },
        thumbnail: { type: DataTypes.TEXT, allowNull: true },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
        unitPrice: { type: DataTypes.INTEGER, allowNull: false },
        lineTotal: { type: DataTypes.INTEGER, allowNull: false }
    }, {
        sequelize,
        modelName: 'OrderItem',
        tableName: 'order_items',
        timestamps: true
    });

    return OrderItem;
};
