/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Job = require('./Job');
var BusinessBase = require('../BusinessBase');
var utils = require('../../lib/utils');
var JobProcessOrderData = modelBase.define('JobProcessOrderData', {
    ident: modelBase.Sequelize.STRING,
    name: modelBase.Sequelize.STRING,
    processOrderIdent: modelBase.Sequelize.STRING,
    processOrderId: modelBase.Sequelize.INTEGER,
    jobIdent: modelBase.Sequelize.STRING,
    mixerIdent: modelBase.Sequelize.STRING,
    packSize: modelBase.Sequelize.DECIMAL,
    mixingTime: modelBase.Sequelize.INTEGER,
    isMedicatedOrder: modelBase.Sequelize.BOOLEAN
}, {
    classMethods: {
        getMaxId: function () {
            return new Promise(function (resolve, reject) {
                modelBase.query('select max(id) from JobProcessOrderDatas', {type: modelBase.QueryTypes.SELECT}).then(function (data) {
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
utils.inherits(JobProcessOrderData.Instance.prototype, BusinessBase.prototype);
JobProcessOrderData.belongsTo(Job);
module.exports = JobProcessOrderData;