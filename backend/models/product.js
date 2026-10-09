'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Product extends Model {

        static associate(models) {
            Product.belongsTo(models.Category, {
                foreignKey: 'categoryId',
                as: 'category'
            });

            Product.hasMany(models.Variant, {
                foreignKey: 'productId',
                as: 'variants'
            });
        }
    }

    Product.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        hot: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        specs: {
            type: DataTypes.JSON,
            allowNull: true
        },

        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        thumbnail: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        images: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        timestamps: true
    });

    return Product;
};
