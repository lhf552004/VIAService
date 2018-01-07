/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Product = require('./Product');
var Layer = require('./Layer');
var utils = require('../../lib/utils');
var BusinessBase = require('../BusinessBase');
var properties = {
    ident: {type: modelBase.Sequelize.STRING},
    name: modelBase.Sequelize.STRING,
    unitSize: modelBase.Sequelize.DECIMAL,
    nbOfUnits: modelBase.Sequelize.DECIMAL,
    packagingType: modelBase.Sequelize.INTEGER,
    sscc: modelBase.Sequelize.STRING,
    deliveryDate: modelBase.Sequelize.DATE,
    state: modelBase.Sequelize.INTEGER,
    lot:  modelBase.Sequelize.STRING,
    productIdent: modelBase.Sequelize.STRING,
    productName: modelBase.Sequelize.STRING,
    supplierIdent: modelBase.Sequelize.STRING,
    supplierName: modelBase.Sequelize.STRING,
    location: modelBase.Sequelize.STRING
};

var LogisticUnit = modelBase.define('LogisticUnit', properties);
utils.inherits(LogisticUnit.Instance.prototype, BusinessBase.prototype);
LogisticUnit.hasMany(Layer);

LogisticUnit.belongsTo(Product);

console.log('LogisticUnit executed');
module.exports = LogisticUnit;