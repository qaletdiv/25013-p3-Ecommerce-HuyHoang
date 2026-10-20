'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
            Order.belongsTo(models.DiscountAmount, { foreignKey: 'discountId', as: 'discount' });
        }
    }

    Order.init({
        userId: { type: DataTypes.INTEGER, allowNull: false },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'shipping', 'delivering', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending'
        },
        paymentMethod: { type: DataTypes.ENUM('cod', 'stripe'), allowNull: false },
        paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'failed'), allowNull: false, defaultValue: 'pending' },
        subtotal: { type: DataTypes.INTEGER, allowNull: false },
        discountId: { type: DataTypes.INTEGER, allowNull: true },
        discountCode: { type: DataTypes.STRING, allowNull: true },
        discountPercent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        discountAmount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        shippingFee: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        total: { type: DataTypes.INTEGER, allowNull: false },
        shippingName: { type: DataTypes.STRING, allowNull: false },
        shippingPhone: { type: DataTypes.STRING, allowNull: false },
        shippingAddress: { type: DataTypes.STRING, allowNull: false },
        stripeSessionId: { type: DataTypes.STRING, allowNull: true, unique: true },
        cancelledAt: { type: DataTypes.DATE, allowNull: true },
        cancelReason: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'Order',
        tableName: 'orders',
        timestamps: true
    });

    return Order;
};
