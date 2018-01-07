/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Scale = require('./Scale');
var Packer = require('./Packer');
var utils = require('../../lib/utils');
var BusinessBase = require('../BusinessBase');
var Section = modelBase.define('Section',{
    ident : modelBase.Sequelize.STRING,
    name : modelBase.Sequelize.STRING,
    category : modelBase.Sequelize.INTEGER,
    previousState :  modelBase.Sequelize.INTEGER,
    state :  modelBase.Sequelize.INTEGER,
    nodeId: modelBase.Sequelize.STRING,
    jobIdent: modelBase.Sequelize.STRING
});
Section.hasMany(Scale);
Section.hasMany(Packer);

utils.inherits(Section.Instance.prototype, BusinessBase.prototype);
module.exports = Section;