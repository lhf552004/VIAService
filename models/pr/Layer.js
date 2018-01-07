/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var LogisticUnit = require('./LogisticUnit');

var properties = {
    sscc: modelBase.Sequelize.STRING,
    lot: modelBase.Sequelize.STRING,
    bagNo: modelBase.Sequelize.INTEGER,
    state: modelBase.Sequelize.INTEGER,
    size: modelBase.Sequelize.DECIMAL,
    isUsed: modelBase.Sequelize.BOOLEAN,
    actualWeight: modelBase.Sequelize.DECIMAL
};

var Layer = modelBase.define('Layer', properties);



console.log('Layer executed');
module.exports = Layer;