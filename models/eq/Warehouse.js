/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var utils = require('../../lib/utils');
var BusinessBase = require('../BusinessBase');

var Warehouse = modelBase.define('Warehouse',{
    ident : modelBase.Sequelize.STRING,
    name : modelBase.Sequelize.STRING,
    category : modelBase.Sequelize.INTEGER,
    lineIdent: modelBase.Sequelize.STRING,
    mixerIdent: modelBase.Sequelize.STRING,
    currentWeight: modelBase.Sequelize.DECIMAL,
    capacity: modelBase.Sequelize.DECIMAL
});

utils.inherits(Warehouse.Instance.prototype, BusinessBase.prototype);
console.log('Warehouse executed');
module.exports = Warehouse;