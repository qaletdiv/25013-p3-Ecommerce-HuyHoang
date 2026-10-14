'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Review extends Model {
        static associate(models) {
            Review.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    Review.init({
        userId: { type: DataTypes.INTEGER, allowNull: false },
        userName: { type: DataTypes.STRING, allowNull: false },
        rating: { type: DataTypes.INTEGER, allowNull: false },
        comment: { type: DataTypes.TEXT, allowNull: false }
    }, {
        sequelize,
        modelName: 'Review',
        tableName: 'Reviews',
        timestamps: true
    });
    return Review;
};
