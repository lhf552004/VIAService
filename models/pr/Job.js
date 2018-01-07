/**
 * Created by pi on 7/21/16.
 */
var modelBase = require('../ModelBase');
var Line = require('../eq/Line');
var Storage = require('../eq/Storage');
var LayerLog = require('./LayerLog');
var AssemblyItem = require('./AssemblyItem');
var Warehouse = require('../eq/Warehouse');
var TraceLog = require('./TraceLog');
var LogisticUnit = require('./LogisticUnit');
var Product = require('./Product');
var utils = require('../../lib/utils');
var log = require('../../lib/log');
var BusinessBase = require('../BusinessBase');
var JobState = require('../../lib/stateAndCategory/jobState');
var AssemblyState = require('../../lib/stateAndCategory/assemblyState');
var AssemblyCategory = require('../../lib/stateAndCategory/assemblyCategory');
var StorageCategory = require('../../lib/stateAndCategory/storageCategory');
var WarehouseCategory = require('../../lib/stateAndCategory/warehouseCategory');
var getDisplayState = require('../../lib/tools/getDisplayState');
var Promise = require('promise');
var properties = {
    ident: {type: modelBase.Sequelize.STRING},
    erpIdent: modelBase.Sequelize.STRING,
    name: modelBase.Sequelize.STRING,
    visible: modelBase.Sequelize.BOOLEAN,
    locked: modelBase.Sequelize.BOOLEAN,
    isTemplate: modelBase.Sequelize.BOOLEAN,
    PlcJobNumber: modelBase.Sequelize.INTEGER,
    state: modelBase.Sequelize.INTEGER,
    recipeIdent: modelBase.Sequelize.STRING,
    productIdent: modelBase.Sequelize.STRING,
    processOrderIdent: modelBase.Sequelize.STRING,
    productName: modelBase.Sequelize.STRING,
    lineIdent: modelBase.Sequelize.STRING,
    mixerIdent: modelBase.Sequelize.STRING,
    targetWeight: modelBase.Sequelize.DECIMAL,
    actualWeight: modelBase.Sequelize.DECIMAL,
    receiver: modelBase.Sequelize.STRING,
    dispensary: modelBase.Sequelize.STRING
};

var Job = modelBase.define('Job', properties, {
    classMethods: {
        getMaxId: function () {
            return new Promise(function (resolve, reject) {
                modelBase.query('select max(id) from Jobs', {type: modelBase.QueryTypes.SELECT}).then(function (data) {
                    console.log('max ' + data);
                    console.dir(data);
                    var max = data[0]['max(id)'];
                    if (!max) {
                        max = 0;
                    }
                    max++;
                    resolve(pad(max, 6));
                });
                // Job.max('id').then(function (max) {
                //     console.log('max ' + max);
                //     resolve(max);
                // });
            });

        },
        getTranslatedJobs: function (jobs, i18n) {
            var translatedJobs = [];
            //var translatedJobsStr ='';
            jobs.forEach(function (theJob) {
                translatedJobs.push(theJob.getTranslatedJob(i18n));
            });
            return translatedJobs;
        },
        createJob: function (jobInfo, options) {
            var Recipe = require('./Recipe');
            var IngredientComponent = require('./IngredientComponent');
            return modelBase.transaction(function (t1) {
                return Job.create(jobInfo).then(function (newJob) {
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
                            return Recipe.create({
                                Ident: newJob.Ident,
                                Name: newJob.Ident,
                                isTemplate: false,
                                State: JobState.Created,
                                JobId: newJob.id
                            }).then(function (newRecipe) {
                                log.debug('newRecipe');
                                log.debug(newRecipe);
                                RecipeTemplate.getSenders().then(function (ingredients) {
                                    var promises = [];
                                    ingredients.forEach(function (ingredient) {
                                        promises.push(IngredientComponent.create({
                                            category: ingredient.category,
                                            targetPercentage: ingredient.targetPercentage,
                                            targetWeight: ingredient.targetWeight,
                                            storageIdent: ingredient.storageIdent,
                                            ProductId: ingredient.ProductId,
                                            RecipeId: newRecipe.id,
                                            productIdent: ingredient.productIdent,
                                            isActive: ingredient.isActive
                                        }).then(function (newIngredient) {
                                            log.debug('newIngredient');
                                            log.debug(newIngredient);
                                            if (newIngredient) {
                                                log.debug('created new ingredient');

                                            }
                                            else {
                                                log.debug('ingredient is empty');
                                            }
                                        }));
                                    });
                                    return Promise.all(promises);

                                });
                            });
                        } else {
                            error = global.i18n.__('the recipe template is not defined');
                            log.error(error);
                            throw new Error(error);
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

            }).then(function (result) {
                log.debug('Job: createJob: result: ' + result);
                // Transaction has been committed
                // result is whatever the result of the promise chain returned to the transaction callback
            }).catch(function (err) {
                // Transaction has been rolled back
                // err is whatever rejected the promise chain returned to the transaction callback
                log.debug('Job: createJob: err: ' + err);
            });


        }
    }
});
function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length - size);
}
utils.inherits(Job.Instance.prototype, BusinessBase.prototype);
// Job.Instance.prototype.DisplayState = getDisplayState(JobState, this.State);
Job.Instance.prototype.updateIngredients = function () {
    var me = this;
    var Assembly = require('./Assembly');
    return new Promise(function (resolve, reject) {
        me.getRecipe().then(function (theRecipe) {
            if (theRecipe) {
                theRecipe.getSenders().then(function (ingredients) {
                    var needToAssemblyIngrs = [];
                    var promises1 = [];
                    var promise1_1 = new Promise(function (resolve1, reject1) {
                        ingredients.forEach(function (ingredient) {
                            if (ingredient.category === 0) {
                                if (ingredient.ProductId && ingredient.ProductId > 0) {
                                    Storage.findAll({
                                        where: {
                                            ProductId: ingredient.ProductId,
                                            category: 10
                                        }
                                    }).then(function (storages) {
                                        storages.every(function (theStorage) {
                                            if (theStorage.currentWeight >= ingredient.targetWeight) {
                                                ingredient.StorageId = theStorage.id;
                                                ingredient.storageIdent = theStorage.ident;
                                                ingredient.save();
                                                return false;
                                            } else {
                                                return true;
                                            }
                                        });
                                    });
                                    if (!ingredient.StorageId || ingredient.StorageId <= 0) {
                                        Storage.findOne({
                                            where: {
                                                category: StorageCategory.HandTakeStorage,
                                                mixerIdent: me.mixerIdent
                                            }
                                        }).then(function (theHandAdd) {
                                            if (theHandAdd) {
                                                ingredient.StorageId = theHandAdd.id;
                                                ingredient.storageIdent = theHandAdd.ident;
                                                ingredient.save();
                                            } else {
                                                var error = global.i18n.__('hand add not found');
                                                log.error(error);
                                                reject1({error: error});
                                            }

                                        });
                                        needToAssemblyIngrs.push(ingredient);
                                    } else {
                                        Storage.findOne({
                                            where: {
                                                id: ingredient.StorageId
                                            }
                                        }).then(function (theStorage) {
                                            if (theStorage.category === StorageCategory.HandTakeStorage) {
                                                needToAssemblyIngrs.push(ingredient);
                                            }
                                        })
                                    }
                                } else {
                                    var error = global.i18n.__('sender ingredient product not set');
                                    log.error(error);
                                    reject1({error: error});
                                }
                            }
                            //receiver,is normally packer
                            if (ingredient.category === 1) {
                                Storage.findOne({
                                    where: {
                                        category: StorageCategory.PackStorage,
                                        mixerIdent: me.mixerIdent
                                    }
                                }).then(function (thePacker) {
                                    if (thePacker) {
                                        ingredient.StorageId = thePacker.id;
                                        ingredient.storageIdent = thePacker.ident;
                                        ingredient.save();
                                        me.receiver = thePacker.ident;
                                        me.save();
                                        resolve1({receiver: thePacker.ident});
                                    } else {
                                        reject1({error: global.i18n.__('packer not found')});
                                    }

                                });

                            }


                        });
                    });
                    promises1.push(promise1_1);
                    var promise1_2 = new Promise(function (resolve1, reject1) {
                        promise1_1.then(function () {
                            if (needToAssemblyIngrs.length > 0) {
                                var bagAssemblyTarWeight = 0.0;
                                var dispensaryAss;
                                var bagsAss;
                                //hand add warehouse
                                Warehouse.findOne({
                                    where: {
                                        category: WarehouseCategory.HT,
                                        mixerIdent: me.mixerIdent
                                    }
                                }).then(function (theHandAdd) {
                                    if (theHandAdd) {
                                        // theAssembly.target = theHandAdd.ident;
                                        // theAssembly.save();
                                        var promises2 = [];
                                        var length = needToAssemblyIngrs.length;
                                        var index = 0;


                                        updateAssembly(Assembly, me, theHandAdd, needToAssemblyIngrs, length, index).then(function (res) {
                                            resolve1();
                                        }, function (err) {
                                            reject1();
                                        });
                                        // needToAssemblyIngrs.forEach(function (theIngr) {
                                        //     promises2.push(new Promise(function (resolve2, reject2) {
                                        //         LogisticUnit.findOne({
                                        //             where: {
                                        //                 ProductId: theIngr.ProductId,
                                        //                 unitSize: {$lte: theIngr.targetWeight},
                                        //                 location: 'WH'
                                        //             }
                                        //         }).then(function (theLogisticUnit) {
                                        //             if (theLogisticUnit) {
                                        //                 log.debug('find logisticUnit for the weight: ' + theIngr.targetWeight);
                                        //                 _updateAssembly(Assembly, me, theHandAdd, theIngr, theLogisticUnit).then(function (res) {
                                        //                     resolve2(res);
                                        //                 }, function (err) {
                                        //                     reject2(err);
                                        //                 });
                                        //             } else {
                                        //                 //only dispensary assembly
                                        //                 Product.findOne({
                                        //                     where: {id: theIngr.ProductId}
                                        //                 }).then(function (theProduct) {
                                        //                     if (theProduct) {
                                        //                         log.debug('find theProduct for the weight: ' + theProduct.ident);
                                        //                         _updateAssembly(Assembly, me, theHandAdd, theIngr, theProduct).then(function (res) {
                                        //                             resolve2(res);
                                        //                         }, function (err) {
                                        //                             reject2(err);
                                        //                         });
                                        //                     } else {
                                        //                         reject2({error: global.i18n.__('Job: updateIngredients: product not found.')});
                                        //                     }
                                        //                 });
                                        //             }
                                        //
                                        //         });
                                        //     }));
                                        // });
                                        // Promise.all(promises2).then(function (res) {
                                        //     log.debug('Job: updateIngredients: promise: resolve!!!');
                                        //     resolve1(res);
                                        //
                                        // }, function (err) {
                                        //     log.debug('Job: updateIngredients: promise: reject: ' + err);
                                        //     reject1(err);
                                        // });

                                    } else {
                                        var error = global.i18n.__('no handAdd found');
                                        reject1({error: error});
                                    }
                                });

                                promises1.push(promise1_2);
                            } else {
                                resolve1();
                            }
                        })
                    });


                    Promise.all(promises1).then(function (res) {
                        log.debug('Job: updateIngredients: promise: resolve!!!');
                        resolve(res);

                    }, function (err) {
                        log.debug('Job: updateIngredients: promise: reject: ' + err);
                        reject(err);
                    });


                });
            } else {
                reject({error: global.i18n.__('recipe not found')});
            }

        })
    });

};
Job.Instance.prototype.setDisplayState = function () {

    Job.Instance.prototype.displayState = getDisplayState(JobState, this.state);
};
Job.Instance.prototype.getTranslatedJobStr = function (i18n) {

    // var jobStr = JSON.stringify(this);
    // var JSONJob = JSON.parse(jobStr);
    // JSONJob.DisplayState = i18n.__(getDisplayState(JobState, this.State));
    // return JSON.stringify(JSONJob);
    return JSON.stringify(this.getTranslatedJob(i18n));
};
Job.Instance.prototype.getTranslatedJob = function (i18n) {

    var me = this;
    var JSONJob = me.getJsonObject();

    JSONJob.displayState = i18n.__(getDisplayState(JobState, me.state));
    return JSONJob;
};

Job.Instance.prototype.getReceiver = function () {
    var me = this;
    return new Promise(function (resolve, reject) {
        me.getRecipe().then(function (theRecipe) {
            theRecipe.getReceivers({where: {category: 1}}).then(function (receivers) {
                if (receivers && receivers.length > 0) {
                    me.receiver = receivers[0].storageIdent;
                    me.save();
                    resolve(receivers[0]);
                }
                else {
                    var error = global.i18n.__('Job: getReceiver: receiver is not found');
                    reject({error: error});
                }
            })
        })
    });
};
Job.Instance.prototype.getRecipe = function () {
    var Recipe = require('./Recipe');
    var me = this;
    return new Promise(function (resolve, reject) {
        Recipe.findOne({where: {JobId: me.id}}).then(function (theRecipe) {
            if (theRecipe) {
                resolve(theRecipe);
            } else {
                reject('Recipe not found');
            }
        });
    });
};
function updateAssembly(Assembly, theJob, theHandAdd, needToAssemblyIngrs, length, index) {
    var theIngr = needToAssemblyIngrs[index];
    return new Promise(function (resolve, reject) {
        LogisticUnit.findOne({
            where: {
                ProductId: theIngr.ProductId,
                unitSize: {$lte: theIngr.targetWeight},
                location: 'WH'
            }
        }).then(function (theLogisticUnit) {
            if (theLogisticUnit) {
                log.debug('find logisticUnit for the weight: ' + theIngr.targetWeight);
                _updateAssembly(Assembly, theJob, theHandAdd, theIngr, theLogisticUnit).then(function (res) {
                    index++;
                    if (index < length) {
                        updateAssembly(Assembly, theJob, theHandAdd, needToAssemblyIngrs, length, index).then(function (res) {
                            resolve(res);
                        }, function (err) {
                            reject(err);
                        })
                    } else {
                        resolve(res);
                    }

                }, function (err) {
                    reject(err);
                });
            } else {
                //only dispensary assembly
                Product.findOne({
                    where: {id: theIngr.ProductId}
                }).then(function (theProduct) {
                    if (theProduct) {
                        log.debug('find theProduct for the weight: ' + theProduct.ident);
                        _updateAssembly(Assembly, theJob, theHandAdd, theIngr, theProduct).then(function (res) {
                            index++;
                            if (index < length) {
                                updateAssembly(Assembly, theJob, theHandAdd, needToAssemblyIngrs, length, index).then(function (res) {
                                    resolve(res);
                                }, function (err) {
                                    reject(err);
                                })
                            } else {
                                resolve(res);
                            }
                        }, function (err) {

                        });
                    } else {
                        reject({error: global.i18n.__('Job: updateIngredients: product not found.')});
                    }
                });
            }

        });
    })

}

function _updateAssembly(Assembly, theJob, theHandAdd, theIngr, unit) {
    var noOfBag = 0.0;
    noOfBag = Math.floor(theIngr.targetWeight / unit.unitSize);
    var targetWeight = noOfBag * unit.unitSize;
    var remainWeight = theIngr.targetWeight - targetWeight;
    log.debug('noOfBag: ' + noOfBag);
    log.debug('targetWeight: ' + targetWeight);
    log.debug('remainWeight: ' + remainWeight);
    return new Promise(function (resolve, reject) {
        var promises = [];
        if (targetWeight > 0) {
            var promise1 = new Promise(function (resolve1, reject1) {
                Assembly.findOne({
                        where: {
                            JobId: theJob.id,
                            category: AssemblyCategory.Macro
                        }
                    }
                ).then(function (theAssembly) {
                    if (theAssembly) {
                        log.debug('find the assembly');
                        log.debug(theAssembly);
                        theAssembly.targetWeight += targetWeight;
                        theAssembly.save();
                        _updateIngredients(theAssembly, targetWeight, theIngr, unit).then(function (res) {
                            resolve1(res);
                        }, function (err) {
                            reject1(err);
                        });
                    } else {
                        Assembly.create({
                            JobId: theJob.id,
                            category: AssemblyCategory.Macro,
                            state: AssemblyState.Created,
                            sscc: theJob.ident + '_B_01_' + Math.ceil(Math.random() * 100),
                            location: 'WH',
                            source: 'WH',
                            target: theHandAdd.ident,
                            jobIdent: theJob.ident,
                            targetWeight: targetWeight
                        }).then(function (newAssembly) {
                            log.debug('create new assembly');
                            log.debug(newAssembly);
                            _updateIngredients(newAssembly, targetWeight, theIngr, unit).then(function (res) {
                                resolve1(res);
                            }, function (err) {
                                reject1(err);
                            });
                        });
                    }


                });
            });
            promises.push(promise1);
        }
        if (remainWeight > 0) {
            var promise2 = new Promise(function (resolve1, reject1) {
                Assembly.findOne({
                        where: {
                            JobId: theJob.id,
                            category: AssemblyCategory.Micro
                        }
                    }
                ).then(function (theAssembly) {
                    if (theAssembly) {
                        theAssembly.targetWeight += remainWeight;
                        theAssembly.save();
                        _updateIngredients(theAssembly, remainWeight, theIngr, unit).then(function (res) {
                            _setDispensary(theJob, theAssembly).then(function (res2) {
                                resolve1();
                            }, function (err2) {
                                reject1(err2);
                            });
                        }, function (err) {
                            reject1(err);
                        });

                    } else {
                        Assembly.create({
                            JobId: theJob.id,
                            category: AssemblyCategory.Micro,
                            state: AssemblyState.Created,
                            sscc: theJob.ident + '_M_01_' + Math.ceil(Math.random() * 100),
                            target: theHandAdd.ident,
                            jobIdent: theJob.ident,
                            targetWeight: remainWeight
                        }).then(function (newAssembly) {
                            _updateIngredients(newAssembly, remainWeight, theIngr, unit).then(function (res) {
                                _setDispensary(theJob, newAssembly).then(function (res2) {
                                    resolve1();
                                }, function (err2) {
                                    reject1(err2);
                                });
                            }, function (err) {
                                reject1(err);
                            });
                        });
                    }
                });
            });
            promises.push(promise2);

        }

        Promise.all(promises).then(function (res) {
            log.debug('Job: _updateAssembly: promise: resolve!!!');
            resolve(res);

        }, function (err) {
            log.debug('Job: _updateAssembly: promise: reject: ' + err);
            reject(err);
        });

    });

}

function _setDispensary(theJob, dispensaryAssembly) {
    return new Promise(function (resolve, reject) {
        Warehouse.findAll({
            where: {
                category: WarehouseCategory.Dis,
                mixerIdent: theJob.mixerIdent
            }
        }).then(function (dispensarys) {
            var theLength = dispensarys.length;
            var theDispensary;
            if (theLength == 0) {
                var error = i18n.__('no dispensary found');
                reject3({error: error});
            } else if (theLength == 1) {
                theDispensary = dispensarys[0];
                if (theDispensary) {
                    dispensaryAssembly.location = theDispensary.ident;
                    dispensaryAssembly.source = theDispensary.ident;
                    dispensaryAssembly.save();
                    theJob.dispensary = theDispensary.ident;
                    theJob.save();
                    resolve({dispensary: theDispensary.ident});
                }

            } else if (theLength == 2) {
                Job.findAll({
                    where: {
                        dispensary: {
                            $in: [dispensarys[0].ident, dispensarys[1].ident]
                        }
                    }
                }).then(function (jobs) {
                    var jobsInDis1 = [];
                    var jobsInDis2 = [];
                    jobs.forEach(function (job) {
                        if (job.dispensary === dispensarys[0].ident) {
                            jobsInDis1.push(job);
                        } else {
                            jobsInDis2.push(job);
                        }
                    });
                    if (jobsInDis1.length <= jobsInDis2.length) {
                        theDispensary = dispensarys[0];
                    } else {
                        theDispensary = dispensarys[1];
                    }
                    if (theDispensary) {
                        dispensaryAssembly.location = theDispensary.ident;
                        dispensaryAssembly.source = theDispensary.ident;
                        dispensaryAssembly.save();
                        theJob.dispensary = theDispensary.ident;
                        theJob.save();
                        resolve({dispensary: theDispensary.ident});
                    }

                });
            } else {
                reject({error: global.i18n.__('too much dispensary')});
            }
        });
    })

}
function _updateIngredients(theAssembly, targetWeight, theIngr, unit) {
    return new Promise(function (resolve, reject) {
        AssemblyItem.findOne({
            where: {
                AssemblyId: theAssembly.id,
                productIdent: theIngr.productIdent
            }
        }).then(function (theItem) {
            if (theItem) {
                theItem.targetWeight = targetWeight;
                theItem.save();
                resolve();
            } else {
                AssemblyItem.create(
                    {
                        AssemblyId: theAssembly.id,
                        productIdent: theIngr.productIdent,
                        targetWeight: targetWeight
                    }).then(function (newItem) {
                    if (newItem) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            }

        });
    })
}

Job.Instance.prototype.isStarted = function () {

};
Job.Instance.prototype.registerAssemblyToStorage = function (theLayer, i18n) {
    var me = this;
    return new Promise(function (resolve, reject) {
        me.getRecipe().then(function (theRecipe) {
            if (theRecipe) {
                theRecipe.getReceivers({where: {category: 1, isActive: true}}).then(function (receviers) {
                    if (receviers.length > 0) {
                        var storageIdent = receviers[0].storageIdent;
                        LayerLog.findOrCreate({
                            where: {
                                jobIdent: me.ident
                            }, defaults: {
                                lot: theLayer.lot,
                                productIdent: me.productIdent,
                                productName: me.productName,
                                jobLogIdent: me.ident,
                                storageIdent: storageIdent,
                                remainWeight: 0
                            }
                        }).spread(function (theLayerLog, created) {
                            if (theLayerLog) {
                                theLayerLog.remainWeight += theLayer.actualWeight;
                                theLayerLog.save().then(function () {
                                    theLayer.destroy();

                                    Storage.findOne({where: {ident: storageIdent}}).then(function (theStorage) {
                                        if (theStorage) {
                                            theStorage.currentWeight += theLayer.actualWeight;
                                            theStorage.save();
                                            resolve(theLayerLog.remainWeight);
                                        }
                                        else {
                                            reject({error: i18n.__('theStorage not found')});
                                        }
                                    });

                                }).catch(function (error) {
                                    reject({error: error});
                                });
                            } else {
                                reject({error: i18n.__('theLayerLog not found')});
                            }
                        })
                    } else {
                        reject({error: i18n.__('receiver not found')});
                    }

                })
            } else {
                reject({error: i18n.__('recipe not found')});
            }
        });
    });


};
Job.Instance.prototype.finishRegisterAssembly = function (source) {
    var me = this;
    LayerLog.findOne({
        where: {
            jobIdent: me.ident
        }
    }).then(function (theLayerLog) {
        if (theLayerLog) {
            TraceLog.create({
                source: source,
                destination: theLayerLog.storageIdent,
                jobLogIdent: me.ident,
                lot: theLayerLog.lot,
                productIdent: theLayerLog.productIdent,
                productName: theLayerLog.productName,
                transferWeight: theLayerLog.remainWeight
            }).then(function (newTraceLog) {

            });
        }
    })
};
Job.Instance.prototype.start = function (controllerManager, i18n) {
    var me = this;
    var error = '';
    var controller;
    return new Promise(function (resolve, reject) {
        me.getLine().then(function (theLine) {
            console.log('TheLine:');
            console.dir(theLine);
            if (theLine) {
                controller = controllerManager.getController(theLine.controllerName);
                controller.startJob(me).then(function (Pres) {
                    me.update({
                        state: JobState.Loading
                    }).then(function (theJob) {
                        console.log("save successfully");
                        resolve();
                    });


                }, function (pErr) {
                    console.dir(pErr);
                    reject(pErr);

                });
            } else {
                error = i18n.__('the line: %s is not found', me.LineId);
                console.log(error);
                reject(error);
            }
        });
    });


};

Job.belongsTo(Line, {as: 'Line'});


console.log('Job executed');
module.exports = Job;