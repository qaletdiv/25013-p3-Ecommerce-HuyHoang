'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Tag extends Model {
        static associate(models) {
            Tag.belongsToMany(models.Product, {
                through: models.ProductTag,
                foreignKey: 'tagId',
                otherKey: 'productId',
                as: 'products'
            });
        }
    }

    Tag.init(
        {
            name: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Tag',
            tableName: 'Tags',
            timestamps: true,
        }
    );
    return Tag;
}