'use strict';
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);
// (Có thể require các model ở đây sau này)
db.Category = require('./category')(sequelize, Sequelize);
db.Product = require('./product')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);
db.Profile = require('./profile')(sequelize, Sequelize);
db.Variant = require('./variants')(sequelize, Sequelize);
db.Size = require('./size')(sequelize, Sequelize);
db.Color = require('./color')(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db)
    }
})


db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;