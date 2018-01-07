/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Discharger = require('./Discharger');

var Scale = modelBase.define('Scale',{
    ident : modelBase.Sequelize.STRING,
    category : modelBase.Sequelize.INTEGER,
    state :  modelBase.Sequelize.INTEGER,
    capacity: modelBase.Sequelize.DECIMAL,
    weightMax: modelBase.Sequelize.DECIMAL,
    currentStorageId: modelBase.Sequelize.INTEGER,
    dosingAmountMax: modelBase.Sequelize.DECIMAL,
    dosingAmountMin: modelBase.Sequelize.DECIMAL,
    dosingWeightMin: modelBase.Sequelize.DECIMAL,
    currentJobIdent: modelBase.Sequelize.STRING
});
Scale.hasMany(Discharger);
module.exports = Scale;