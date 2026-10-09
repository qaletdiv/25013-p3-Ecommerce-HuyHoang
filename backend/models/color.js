'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Color extends Model {

        static associate(models) {
            Color.hasMany(models.Variant, {
                foreignKey: 'colorId',
                as: 'variants'
            });
        }
    }

    Color.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        sequelize,
        modelName: 'Color',
        tableName: 'colors',
        timestamps: false
    });

    return Color;
};
