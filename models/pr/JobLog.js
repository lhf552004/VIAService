/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');

var JobLog = modelBase.define('JobLog',{
    ident : {type: modelBase.Sequelize.STRING},
    erpIdent : modelBase.Sequelize.STRING,
    jobIdent: modelBase.Sequelize.STRING,
    name : modelBase.Sequelize.STRING,
    state :  modelBase.Sequelize.INTEGER,
    recipeIdent : modelBase.Sequelize.STRING,
    lineIdent : modelBase.Sequelize.STRING,
    actualWeight: modelBase.Sequelize.DECIMAL
});

console.log('Joblog executed');
module.exports = JobLog;