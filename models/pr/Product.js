/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var utils = require('../../lib/utils');
var BusinessBase = require('../BusinessBase');
var Product = modelBase.define('Product',{
    ident : modelBase.Sequelize.STRING,
    name : modelBase.Sequelize.STRING,
    category : modelBase.Sequelize.INTEGER,
    state :  modelBase.Sequelize.INTEGER,
    unitSize: modelBase.Sequelize.DECIMAL(10,2),
    shelfLife: modelBase.Sequelize.INTEGER,
    positiveDeviation: modelBase.Sequelize.DECIMAL(10,2),
    negativeDeviation: modelBase.Sequelize.DECIMAL(10,2)
});
utils.inherits(Product.Instance.prototype, BusinessBase.prototype);
module.exports = Product;