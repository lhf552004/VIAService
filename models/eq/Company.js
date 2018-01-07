/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');


var Company = modelBase.define('Company',{
    ident : modelBase.Sequelize.STRING,
    name : modelBase.Sequelize.STRING,
    category : modelBase.Sequelize.INTEGER,
    address :  modelBase.Sequelize.STRING
});

module.exports = Company;