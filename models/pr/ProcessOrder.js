/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Product = require('./Product');
var Line = require('../eq/Line');
var Mixer = require('../eq/Mixer');
var Job = require('./Job');
var JobParameter = require('./JobParameter');
var JobProcessOrderData = require('./JobProcessOrderData');
var OrderState = require('../../lib/stateAndCategory/orderState');
var JobState = require('../../lib/stateAndCategory/jobState');
var OrderItem = require('./OrderItem');
var Promise = require('promise');
var utils = require('../../lib/utils');
var BusinessBase = require('../BusinessBase');
var Recipe = require('./Recipe');
var IngredientComponent = require('./IngredientComponent');
var log = require('../../lib/log');

var ProcessOrder = modelBase.define('ProcessOrder', {
    ident: modelBase.Sequelize.STRING,
    erpIdent: modelBase.Sequelize.STRING,
    name: modelBase.Sequelize.STRING,
    isTemplate: modelBase.Sequelize.BOOLEAN,
    state: modelBase.Sequelize.INTEGER,
    targetWeight: modelBase.Sequelize.DECIMAL,
    packSize: modelBase.Sequelize.DECIMAL,
    productIdent: modelBase.Sequelize.STRING,
    productName: modelBase.Sequelize.STRING,
    mixerIdent: modelBase.Sequelize.STRING,
    lineIdent: modelBase.Sequelize.STRING,
    mixingTime: modelBase.Sequelize.INTEGER,
    isMedicatedOrder: modelBase.Sequelize.BOOLEAN
}, {
    classMethods: {
        getMaxId: function () {
            return new Promise(function (resolve, reject) {
                modelBase.query('select max(id) from ProcessOrders', {type: modelBase.QueryTypes.SELECT}).then(function (data) {
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

utils.inherits(ProcessOrder.Instance.prototype, BusinessBase.prototype);
ProcessOrder.Instance.prototype.checkOrder = function (i18n) {
    var me = this;
    var errors = [];
    var error = '';
    return new Promise(function (resolve, reject) {
        if (!me.ProductId) {
            error = i18n.__('product is not set.');
            errors.push(error);
        }
        if (!me.LineId) {
            error = i18n.__('Line is not set.');
            errors.push(error);
        }
        if (!me.mixerIdent) {
            error = i18n.__('mixerIdent is not set.');
            errors.push(error);
        }
        if (!me.lineIdent) {
            error = i18n.__('lineIdent is not set.');
            errors.push(error);
        }
        if (!me.mixingTime || me.mixingTime <= 0) {
            error = i18n.__('mixingTime is not set.');
            errors.push(error);
        }
        if (!me.isMedicatedOrder) {
            // error = i18n.__('medicated type not set.');
            // errors.push(error);
            //TODO
            //cross function not implemented
        }
        if (!me.targetWeight || me.targetWeight <= 0) {
            error = i18n.__('targetWeight is not set.');
            errors.push(error);
        }
        if (!me.packSize || me.packSize <= 0) {
            error = i18n.__('packSize is not set.');
            errors.push(error);
        }
        me.getOrderItems().then(function (orderItems) {
            if (orderItems.length === 0) {
                error = i18n.__('BOM is not found.');
                errors.push(error);
                reject(errors);
            }
            else {
                var totalTargetPer = 0.0;
                orderItems.forEach(function (orderItem) {
                    if (!orderItem.ProductId) {
                        error = i18n.__('product of item is not set.');
                        errors.push(error);
                    }
                    totalTargetPer += orderItem.targetPercentage;
                });
                if (totalTargetPer != 100.0) {
                    error = i18n.__('recipe percentage should be 100.');
                    errors.push(error);
                }
                if (errors.length > 0) {
                    reject(errors);
                } else {
                    resolve();
                }

            }
        });
    });


};
ProcessOrder.Instance.prototype.createOrUpdateJob = function (jobInfo) {
    var me = this;
    return new Promise(function (resolve, reject) {
        Job.create(jobInfo).then(function (newJob) {
            // for(var p in newJob){
            //     console.log('Job property: ' + p);
            // }
            log.debug('newJob');
            log.debug(newJob);

            Recipe.findOne({
                where: {
                    LineId: newJob.LineId,
                    isTemplate: true
                }
            }).then(function (RecipeTemplate) {
                log.debug('RecipeTemplate: ');
                log.debug(RecipeTemplate);
                if (RecipeTemplate) {
                    Recipe.create({
                        Ident: newJob.Ident,
                        Name: newJob.Ident,
                        isTemplate: false,
                        State: JobState.Created,
                        JobId: newJob.id
                    }).then(function (newRecipe) {
                        log.debug('newRecipe');
                        log.debug(newRecipe);
                        if (newRecipe) {
                            var promises = [];

                            var promise1 = new Promise(function (resolve1, reject1) {
                                me.getOrderItems().then(function (orderItems) {
                                    var promises1 = [];
                                    orderItems.forEach(function (orderItem) {
                                        var ingredientInfo = {
                                            category: 0,
                                            targetPercentage: orderItem.targetPercentage,
                                            targetWeight: orderItem.targetPercentage * newJob.targetWeight *0.01,
                                            ProductId: orderItem.ProductId,
                                            RecipeId: newRecipe.id,
                                            productIdent: orderItem.productIdent,
                                            isActive: false
                                        };
                                        promises1.push(new Promise(function (resolve2, reject2) {
                                            IngredientComponent.create(ingredientInfo).then(function (newIngred) {
                                                if (newIngred) {
                                                    resolve2();
                                                } else {
                                                    reject2('new ingre is failed');
                                                }
                                            });
                                        }));

                                    });
                                    Promise.all(promises1).then(function (res) {
                                        resolve1(res);

                                    }, function (err) {
                                        log.debug('ProcessOrder: createOrUpdateJob: promises1: reject: ' + err);
                                        reject1(err);
                                    });

                                });
                            });
                            promises.push(promise1);
                            var promise2 = new Promise(function (resolve1, reject1) {
                                RecipeTemplate.getReceivers({where: {category: 1}}).then(function (ingredients) {
                                    var promises2 = [];
                                    ingredients.forEach(function (ingredient) {
                                        promises2.push(
                                            new Promise(function (resolve2, reject2) {
                                                IngredientComponent.create({
                                                    category: ingredient.category,
                                                    targetPercentage: ingredient.targetPercentage,
                                                    targetWeight: ingredient.targetWeight,
                                                    storageIdent: ingredient.storageIdent,
                                                    ProductId: ingredient.ProductId,
                                                    RecipeId: newRecipe.id,
                                                    productIdent: me.productIdent,
                                                    isActive: ingredient.isActive
                                                }).then(function (newIngredient) {
                                                    log.debug('newIngredient');
                                                    log.debug(newIngredient);
                                                    if (newIngredient) {
                                                        log.debug('created new ingredient');
                                                        resolve2();
                                                    }
                                                    else {
                                                        log.debug('ingredient is empty');
                                                        reject2('ingredient is empty');
                                                    }
                                                });
                                            })
                                        );
                                    });
                                    Promise.all(promises2).then(function (res) {
                                        resolve1(res);

                                    }, function (err) {
                                        log.debug('ProcessOrder: createOrUpdateJob: promise1_3: reject: ' + err);
                                        reject1(err);
                                    });

                                });
                            });
                            JobProcessOrderData.create({
                                processOrderIdent: me.ident,
                                processOrderId:me.id,
                                jobIdent: newJob.ident,
                                JobId: newJob.id,
                                mixerIdent: me.mixerIdent,
                                packSize: me.packSize,
                                mixingTime: me.mixingTime,
                                isMedicatedOrder: me.isMedicatedOrder
                            });
                            JobParameter.findAll({where:{RecipeId: RecipeTemplate.id}}).then(function (parameters) {
                                parameters.forEach(function (curPara) {
                                    var paraInfo = {
                                        ident: curPara.ident,
                                        name: curPara.name,
                                        jobIdent: newJob.ident,
                                        JobId:newJob.id,
                                        nodeId: curPara.nodeId,
                                        nodeValue: curPara.nodeValue,
                                        type: curPara.type,
                                        RecipeId: curPara.RecipeId
                                    };
                                    if(curPara.ident === 'mainMixingTime'){
                                        paraInfo.nodeValue = me.mixingTime;
                                    }
                                    if(curPara.ident === 'packSize'){
                                        paraInfo.nodeValue = me.packSize;
                                    }
                                    if(curPara.ident === 'mixerIdent'){
                                        paraInfo.nodeValue = me.mixerIdent;
                                    }
                                    JobParameter.create(paraInfo).then(function (newPara) {

                                    })

                                })
                            });

                            promises.push(promise2);
                            Promise.all(promises).then(function (res) {
                                resolve(res);

                            }, function (err) {
                                log.debug('ProcessOrder: createOrUpdateJob: promises: reject: ' + err);
                                reject(err);
                            });
                        }

                    });
                } else {
                    error = global.i18n.__('the recipe template is not defined');
                    log.error(error);
                    reject(error);
                }

                // //console.log('Job addLine: ' + newJob.addLine);
                // console.log('Job setLine: ' + newJob.setLine);
                // console.log('Job getLine: ' + newJob.getLine);
                // console.log('new Job: ' + JSON.stringify(newJob));
                // var newJobStr = newJob.getTranslatedJobStr(i18n);
                // console.log('converted new Job: ' + newJobStr);
                // res.json({newJobStr: newJobStr});
            });
        });
    });

};

ProcessOrder.Instance.prototype.releaseOrder = function (i18n) {
    var me = this;
    return new Promise(function (resolve, reject) {
        me.checkOrder(i18n).then(function () {
            Mixer.findOne({where: {ident: me.mixerIdent}}).then(function (theMixer) {
                if (theMixer) {
                    var remainWeight = 0;
                    var theMaxWeight = theMixer.weightMax;
                    var promises = [];
                    if (me.targetWeight > theMaxWeight) {
                        var count = me.targetWeight / theMaxWeight;
                        var i = 0;

                        for (i = 1; i <= count; i++) {

                            promises.push(me.createOrUpdateJob({
                                ident: me.ident + ':' + utils.pad(i, 6),
                                name: me.lineIdent,
                                lineIdent: me.lineIdent,
                                mixerIdent: me.mixerIdent,
                                visible: true,
                                isTemplate: false,
                                locked: true,
                                targetWeight: theMaxWeight,
                                actualWeight: 0.0,
                                state: JobState.Released,
                                LineId: me.LineId,
                                processOrderIdent: me.ident,
                                productIdent: me.productIdent,
                                productName: me.productName
                            }));

                        }
                        remainWeight = me.targetWeight - count * theMaxWeight;
                        if (remainWeight > 0) {
                            promises.push(me.createOrUpdateJob({
                                ident: me.ident + ':' + utils.pad(i + 1, 6),
                                name: me.lineIdent,
                                lineIdent: me.lineIdent,
                                mixerIdent: me.mixerIdent,
                                visible: true,
                                isTemplate: false,
                                locked: true,
                                targetWeight: remainWeight,
                                actualWeight: 0.0,
                                state: JobState.Released,
                                LineId: me.LineId,
                                processOrderIdent: me.ident,
                                productIdent: me.productIdent,
                                productName: me.productName
                            }));
                        }
                    } else {
                        if (me.targetWeight < theMixer.weightMin) {
                            reject({error: global.i18n.__('target weight is too small.')});
                        } else {
                            var promise1 = new Promise(function (resolve1, reject1) {
                                me.createOrUpdateJob({
                                    ident: me.ident,
                                    name: me.lineIdent,
                                    lineIdent: me.lineIdent,
                                    mixerIdent: me.mixerIdent,
                                    visible: true,
                                    isTemplate: false,
                                    locked: true,
                                    targetWeight: me.targetWeight,
                                    actualWeight: 0.0,
                                    state: JobState.Released,
                                    LineId: me.LineId,
                                    processOrderIdent: me.ident,
                                    productIdent: me.productIdent,
                                    productName: me.productName
                                }).then(function (res) {
                                    log.debug('ProcessOrder: releaseOrder: res: ' + res);
                                    resolve1();
                                },function (err) {
                                    log.debug('ProcessOrder: releaseOrder: promises: reject: ' + err);
                                    reject1(err);
                                });
                            });
                            promises.push(promise1);


                        }
                    }
                    Promise.all(promises).then(function (res) {
                        resolve(res);

                    }, function (err) {
                        log.debug('ProcessOrder: releaseOrder: promises: reject: ' + err);
                        reject(err);
                    });
                }
                else {
                    reject({error: global.i18n.__('theMixer is not found.')});
                }
            })
        }, function (errors) {
            reject({errors: errors});
        })
    });

};


ProcessOrder.belongsTo(Product);
ProcessOrder.belongsTo(Job);
ProcessOrder.belongsTo(Line);
ProcessOrder.hasMany(OrderItem);
module.exports = ProcessOrder;