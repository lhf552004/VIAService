/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Filler = require('./Filler');
var Discharger = require('./Discharger');
var Product = require('../pr/Product');
var utils = require('../../lib/utils');
var BusinessBase = require('../BusinessBase');

var Storage = modelBase.define('Storage',{
    ident : modelBase.Sequelize.STRING,
    name : modelBase.Sequelize.STRING,
    category : modelBase.Sequelize.INTEGER,
    lineIdent: modelBase.Sequelize.STRING,
    currentWeight: modelBase.Sequelize.DECIMAL,
    capacity: modelBase.Sequelize.DECIMAL
});

Storage.hasMany(Filler);
Storage.hasMany(Discharger);
Storage.belongsTo(Product);
utils.inherits(Storage.Instance.prototype, BusinessBase.prototype);
console.log('Storage executed');
module.exports = Storage;