/**
 * Created by pi on 7/21/16.
 */
/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');

var properties = {
    userName: modelBase.Sequelize.STRING,
    displayName: modelBase.Sequelize.STRING,
    password: modelBase.Sequelize.STRING,
    isAdministrator: modelBase.Sequelize.BOOLEAN,
    isEngineer: modelBase.Sequelize.BOOLEAN,
    isActive: modelBase.Sequelize.BOOLEAN
};

var User = modelBase.define('User', properties);

User.Instance.prototype.getUserWithoutPW = function () {
    var userStr = JSON.stringify(this);
    var userJSON = JSON.parse(userStr);
    delete userJSON.Password;
    console.log('userJSON');
    console.dir(userJSON);
    return userJSON;
};

console.log('User executed');
module.exports = User;