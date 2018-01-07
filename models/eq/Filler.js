/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');

var Filler = modelBase.define('Filler',{
    ident : modelBase.Sequelize.STRING,
    name : modelBase.Sequelize.STRING,
    category : modelBase.Sequelize.INTEGER,
});

module.exports = Filler;