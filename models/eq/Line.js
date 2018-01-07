/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Section = require('./Section');
var utils = require('../../lib/utils');
var BusinessBase = require('../BusinessBase');
var Line = modelBase.define('Line',{
    ident : modelBase.Sequelize.STRING,
    nodeId : modelBase.Sequelize.STRING,
    name : modelBase.Sequelize.STRING,
    isEnabled : modelBase.Sequelize.BOOLEAN,
    category : modelBase.Sequelize.INTEGER,
    state :  modelBase.Sequelize.INTEGER,
    controllerName : modelBase.Sequelize.STRING
});
Line.hasMany(Section);
utils.inherits(Line.Instance.prototype, BusinessBase.prototype);
console.log('Line executed');
module.exports = Line;