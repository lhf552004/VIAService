/**
 * Created by pi on 8/2/16.
 */
/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var BusinessBase = require('../BusinessBase');
var utils = require('../../lib/utils');

var AssemblyItem = modelBase.define('AssemblyItem',{
    ident : modelBase.Sequelize.STRING,
    category : modelBase.Sequelize.INTEGER,
    targetWeight: modelBase.Sequelize.DECIMAL,
    actualWeight: modelBase.Sequelize.DECIMAL,
    isFinished: modelBase.Sequelize.BOOLEAN,
    productIdent : modelBase.Sequelize.STRING
});



utils.inherits(AssemblyItem.Instance.prototype, BusinessBase.prototype);

module.exports = AssemblyItem;