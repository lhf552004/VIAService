/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var properties = {
    ident : modelBase.Sequelize.STRING,
    name : modelBase.Sequelize.STRING,
    category : modelBase.Sequelize.INTEGER,
};
properties = modelBase.expendGcsProperty(properties);
var Discharger = modelBase.define('Discharger',properties);

module.exports = Discharger;