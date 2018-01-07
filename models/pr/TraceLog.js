/**
 * Created by pi on 9/8/16.
 */
var modelBase = require('../ModelBase');

var properties = {
    source: modelBase.Sequelize.STRING,
    destination: modelBase.Sequelize.STRING,
    jobLogIdent: modelBase.Sequelize.STRING,
    lot: modelBase.Sequelize.STRING,
    productIdent: modelBase.Sequelize.STRING,
    productName: modelBase.Sequelize.STRING,
    transferWeight: modelBase.Sequelize.DECIMAL
};

var TraceLog = modelBase.define('TraceLog', properties);



console.log('TraceLog executed');
module.exports = TraceLog;