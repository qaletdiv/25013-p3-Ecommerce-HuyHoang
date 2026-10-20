'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Cart extends Model {
        static associate(models) {
            Cart.hasMany(models.User, {
                foreignKey: 'cartId',
                as: 'products'
            });
        }
    }

    Cart.init
        

    return Cart;
};