/**
 * Created by pi on 9/8/16.
 */
var modelBase = require('../ModelBase');

var properties = {
    jobIdent: modelBase.Sequelize.STRING,
    jobLogIdent: modelBase.Sequelize.STRING,
    lot: modelBase.Sequelize.STRING,
    productIdent: modelBase.Sequelize.STRING,
    productName: modelBase.Sequelize.STRING,
    storageIdent: modelBase.Sequelize.STRING,
    remainWeight: modelBase.Sequelize.DECIMAL
};

var LayerLog = modelBase.define('LayerLog', properties);



console.log('TraceLog executed');
module.exports = LayerLog;