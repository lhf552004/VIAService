/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var User = require('./User');
var AccessRight = require('./AccessRight');
var GroupUser = require('./GroupUser');
var properties = {
    ident: modelBase.Sequelize.STRING,
    name: modelBase.Sequelize.STRING
};

var UserGroup = modelBase.define('UserGroup', properties);


UserGroup.belongsToMany(User, {through: GroupUser, foreignKey: 'userId'});
User.belongsToMany(UserGroup, {through: GroupUser, foreignKey: 'usergroupId'});
UserGroup.hasMany(AccessRight);


console.log('UserGroup executed');
module.exports = UserGroup;