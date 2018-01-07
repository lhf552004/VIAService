/**
 * Created by pi on 7/21/16.
 */
var Sequelize = require('sequelize');
var database = require('../lib/database');
var cls = require('continuation-local-storage'),
    namespace = cls.createNamespace('model-ns');
Sequelize.cls = namespace;
// var sequelize = new Sequelize(database.database, database.connection.user, database.connection.password);
var sequelize = new Sequelize(database.database, database.connection.user, database.connection.password, {
    host: 'localhost',
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});
sequelize.Sequelize = Sequelize;
sequelize
    .authenticate()
    .then(function (err) {
        console.log('MySql Connection has been established successfully.');
    })
    .catch(function (err) {
        console.log('Unable to connect to the database:', err);
    });
console.log('ModelBase executed');
var GcsProperties = {
    nodeId: Sequelize.STRING
};
sequelize.expendGcsProperty = function (subProperties) {
    return this.expendProperty(GcsProperties, subProperties);
};
sequelize.expendProperty = function (ParentProperties, subProperties) {
    for (var p in ParentProperties) {
        if (subProperties.hasOwnProperty[p]) continue;
        subProperties[p] = ParentProperties[p];
    }
    return subProperties;
};
module.exports = sequelize;
