/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Recipe = require('./Recipe');
var BusinessBase = require('../BusinessBase');
var utils = require('../../lib/utils');
var JobParameter = modelBase.define('JobParameter',{
    ident : modelBase.Sequelize.STRING,
    name : modelBase.Sequelize.STRING,
    jobIdent : modelBase.Sequelize.STRING,
    JobId: modelBase.Sequelize.INTEGER,
    nodeId : modelBase.Sequelize.STRING,
    nodeValue : modelBase.Sequelize.STRING,
    type: modelBase.Sequelize.INTEGER
},{
    classMethods: {
        getMaxId: function () {
            return new Promise(function (resolve, reject) {
                modelBase.query('select max(id) from JobParameters', {type: modelBase.QueryTypes.SELECT}).then(function (data) {
                    console.log('max ' + data);
                    console.dir(data);
                    var max = data[0]['max(id)'];
                    if (!max) {
                        max = 0;
                    }
                    max++;
                    resolve(utils.pad(max, 6));
                });
                // Job.max('id').then(function (max) {
                //     console.log('max ' + max);
                //     resolve(max);
                // });
            });

        }
    }
});
utils.inherits(JobParameter.Instance.prototype, BusinessBase.prototype);
JobParameter.belongsTo(Recipe);
module.exports = JobParameter;