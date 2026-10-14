'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasOne(models.Profile, {
                foreignKey: 'userId',
                as: 'profile'
            });
        }
    }

    User.init({
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        address: DataTypes.STRING,
        avatar: DataTypes.STRING,
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            defaultValue: 'user',
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        timestamps: true,
        // Ẩn trường pass word khi truy vấn dữ liệu
        defaultScope: {
            attributes: { exclude: ['password'] }
        },
        scopes: {
            withPassword: {
                attributes: { include: ['password'] }
            }
        }
    });
    return User;
}