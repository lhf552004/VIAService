/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');

var properties = {
    ident: modelBase.Sequelize.STRING,
    name: modelBase.Sequelize.STRING
};

var AccessRight = modelBase.define('AccessRight', properties);



console.log('AccessRight executed');
module.exports = AccessRight;