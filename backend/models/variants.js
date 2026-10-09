'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Variant extends Model {

        static associate(models) {
            Variant.belongsTo(models.Product, {
                foreignKey: 'productId',
                as: 'product'
            });

            Variant.belongsTo(models.Size, {
                foreignKey: 'sizeId',
                as: 'size'
            });

            Variant.belongsTo(models.Color, {
                foreignKey: 'colorId',
                as: 'color'
            });
        }
    }

    Variant.init({
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        sizeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        colorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'Variant',
        tableName: 'variants',
        timestamps: false
    });

    return Variant;
};
