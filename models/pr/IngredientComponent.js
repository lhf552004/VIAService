/**
 * Created by pi on 8/2/16.
 */
/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Product = require('./Product');
var Storage = require('../eq/Storage');
var BusinessBase = require('../BusinessBase');
var utils = require('../../lib/utils');

var IngredientComponent = modelBase.define('IngredientComponent',{
    ident : modelBase.Sequelize.STRING,
    category : modelBase.Sequelize.INTEGER,
    targetPercentage: modelBase.Sequelize.DECIMAL,
    targetWeight: modelBase.Sequelize.DECIMAL,
    actualWeight: modelBase.Sequelize.DECIMAL,
    storageIdent : modelBase.Sequelize.STRING,
    productIdent : modelBase.Sequelize.STRING,
    isActive: modelBase.Sequelize.BOOLEAN
});
IngredientComponent.belongsTo(Product);
IngredientComponent.belongsTo(Storage);

utils.inherits(IngredientComponent.Instance.prototype, BusinessBase.prototype);

module.exports = IngredientComponent;