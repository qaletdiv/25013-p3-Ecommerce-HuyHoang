'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Profile extends Model {
        static associate(models) {
            Profile.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
        }
    }
    Profile.init({
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        bio: DataTypes.TEXT,
        userId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Profile',
        tableName: 'Profiles',
        timestamps: true
    });
    return Profile;
}