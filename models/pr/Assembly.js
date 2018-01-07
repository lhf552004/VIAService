/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Job = require('./Job');
var AssemblyItem = require('./AssemblyItem');
var Layer = require('./Layer');
var properties = {
    jobIdent: {type: modelBase.Sequelize.STRING},
    name: modelBase.Sequelize.STRING,
    sscc: modelBase.Sequelize.STRING,
    deliveryDate: modelBase.Sequelize.DATE,
    state: modelBase.Sequelize.INTEGER,
    targetWeight: modelBase.Sequelize.DECIMAL(10,2),
    actualWeight: modelBase.Sequelize.DECIMAL(10,2),
    location:modelBase.Sequelize.STRING,
    source:modelBase.Sequelize.STRING,
    target:modelBase.Sequelize.STRING,
    category: modelBase.Sequelize.INTEGER
};

var Assembly = modelBase.define('Assembly', properties);
Assembly.hasMany(AssemblyItem);

Assembly.belongsTo(Job);

console.log('Assembly executed');
module.exports = Assembly;