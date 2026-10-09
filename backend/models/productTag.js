'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ProductTag extends Model {
        static associate(models) {
            ProductTag.belongsTo(models.Product, {
                foreignKey: 'productId',
                as: 'product'
            });
            ProductTag.belongsTo(models.Tag, {
                foreignKey: 'tagId',
                as: 'tag'
            });
        }
    }
    ProductTag.init(
        {
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tagId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'ProductTag',
            tableName: 'ProductTags',
            timestamps: true,
        }
    );
    return ProductTag;
};