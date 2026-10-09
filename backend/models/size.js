'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Size extends Model {

        static associate(models) {
            Size.hasMany(models.Variant, {
                foreignKey: 'sizeId',
                as: 'variants'
            });
        }
    }

    Size.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        sequelize,
        modelName: 'Size',
        tableName: 'sizes',
        timestamps: false
    });

    return Size;
};
