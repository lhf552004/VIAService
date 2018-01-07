/**
 * Created by pi on 8/2/16.
 */
/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Product = require('./Product');
var BusinessBase = require('../BusinessBase');
var utils = require('../../lib/utils');

var OrderItem = modelBase.define('OrderItem',{
    ident : modelBase.Sequelize.STRING,
    category : modelBase.Sequelize.INTEGER,
    targetPercentage: modelBase.Sequelize.DECIMAL,
    targetWeight: modelBase.Sequelize.DECIMAL,
    productIdent : modelBase.Sequelize.STRING,
    isActive: modelBase.Sequelize.BOOLEAN
});
OrderItem.belongsTo(Product);

utils.inherits(OrderItem.Instance.prototype, BusinessBase.prototype);

module.exports = OrderItem;