/**
 * Created by pi on 8/2/16.
 */
var util = require('util');
var myUtils = require('../utils');
var ControllerBase = require('./controllerBase');
var GcsState = require('../stateAndCategory/gcsState');
var SectionCategory = require('../stateAndCategory/sectionCategory');
var JobState = require('../stateAndCategory/jobState');
var DataType = require('node-opcua').DataType;
var Line = require('../../models/eq/Line');
var Job = require('../../models/pr/Job');
var Recipe = require('../../models/pr/Recipe');
var JobLog = require('../../models/pr/JobLog');
var Assembly = require('../../models/pr/Assembly');
var JobParameter = require('../../models/pr/JobParameter');
var Promise = require('promise');
var log = require('../log');
// var EventEmitter = require("events").EventEmitter;
var ProduceController = function (gcObjectAdapter, i18n, io) {
    this.i18n = i18n;
    this.gcObjectAdapter = gcObjectAdapter;
    this.io = io;
    var me = this;
    this.category = 0;
    // io.on('connection', function (socket) {
    //     me.on('lineStateChanged', function (options) {
    //
    //         socket.emit('lineStateChanged', options);
    //
    //     });
    //     me.on('lineStateChanged', function (options) {
    //
    //         socket.emit('lineStateChanged', options);
    //
    //     });
    //     me.on('jobStateChanged', function (options) {
    //
    //         socket.emit('jobStateChanged', options);
    //
    //     });
    // });
};

// util.inherits(ProduceController, EventEmitter);
util.inherits(ProduceController, ControllerBase);
ProduceController.prototype._checkJob = function (job) {
    var errors = [];
    var error = '';
    var me = this;
    return new Promise(function (resolve, reject) {
        if (job) {
            if (job.targetWeight <= 0) {
                error = me.i18n.__('target weight should be positive.');
                errors.push(error);
                reject(errors);
            }
            if (job.LineId) {
                Line.findOne({
                    where: {id: job.LineId}
                }).then(function (theLine) {
                    if (theLine) {
                        if (theLine.state === GcsState.Passive) {
                            Recipe.findOne({
                                where: {
                                    JobId: job.id
                                }
                            }).then(function (theRecipe) {
                                if (theRecipe) {
                                    if (theRecipe.isTemplate) {
                                        error = me.i18n.__('Recipe of job should not be template.');
                                        errors.push(error);
                                        reject({errors: errors});
                                    }
                                    else {
                                        var promises = [];
                                        var promise1 = new Promise(function (resolve1, reject1) {
                                            Assembly.findAll({where: {JobId: job.id}}).then(function (assemblies) {
                                                var isAllReady = true;
                                                assemblies.forEach(function (assembly) {
                                                    if(assembly.state != 3){
                                                        isAllReady = false;
                                                    }
                                                });
                                                if(isAllReady === true){
                                                    resolve1()
                                                }else{
                                                    error = me.i18n.__('assembly is not ready');
                                                    reject1({error:error});
                                                }
                                            });
                                        });
                                        promises.push(promise1);
                                        var promise2 = new Promise(function (resolve1, reject1) {
                                            JobParameter.findAll({where: {JobId: job.id}}).then(function (parameters) {
                                                var length = parameters.length;
                                                var results = [];
                                                for(var i = 0; i<length; i++){
                                                    if(parameters[i].ident === 'mixerIdent'){
                                                        if(!parameters[i].nodeValue || parameters[i].nodeValue == ''){
                                                            error = me.i18n.__('mixer Ident is not set');
                                                            errors.push(error);
                                                        }
                                                        if(!parameters[i].nodeId ||parameters[i].nodeId ==''){
                                                            error = me.i18n.__('mixerIdent nodeId is not set');
                                                            errors.push(error);
                                                        }
                                                    }
                                                    if(parameters[i].ident === 'packSize'){
                                                        if(!parameters[i].nodeValue || parameters[i].nodeValue == ''){
                                                            error = me.i18n.__('pack size is not set');
                                                            errors.push(error);
                                                        }
                                                        if(!parameters[i].nodeId ||parameters[i].nodeId ==''){
                                                            error = me.i18n.__('packSize nodeId is not set');
                                                            errors.push(error);
                                                        }
                                                    }
                                                    if(parameters[i].ident === 'mainMixingTime'){
                                                        if(!parameters[i].nodeValue || parameters[i].nodeValue == ''){
                                                            error = me.i18n.__('mixing time is not set');
                                                            errors.push(error);
                                                        }
                                                        if(!parameters[i].nodeId ||parameters[i].nodeId ==''){
                                                            error = me.i18n.__('mainMixingTime nodeId is not set');
                                                            errors.push(error);
                                                        }
                                                    }
                                                }
                                                if(errors.length>0){
                                                    reject1({errors: errors});
                                                }else{
                                                    resolve1();
                                                }
                                            });
                                        });
                                        promises.push(promise2);
                                        var promise3 = new Promise(function (resolve1, reject1) {
                                            theRecipe.getSenders().then(function (ingredients) {

                                                var promisesIng = [];
                                                ingredients.forEach(function (ingredient) {
                                                    if (ingredient.category === 0) {
                                                        promisesIng.push(me.checkStorageIngredient(ingredient));
                                                    } else if (ingredient.category === 1) {
                                                        promisesIng.push(me.checkGateStorageOrPackerIngredient(ingredient,theLine.ident));
                                                    }
                                                });
                                                Promise.all(promisesIng).then(function (res) {
                                                    log.debug('produceController: _checkJob: promise3: resolve!!!');
                                                    resolve1(res);

                                                }, function (err) {
                                                    log.debug('produceController: _checkJob: promise3: reject: ');
                                                    log.debug(err);
                                                    reject1(err);
                                                });

                                            });
                                        });
                                        promises.push(promise3);
                                        Promise.all(promises).then(function (res) {
                                            log.debug('produceController: _checkJob: promises: resolve!!!');
                                            resolve(res);

                                        }, function (err) {
                                            log.debug('produceController: _checkJob: promises: reject: ');
                                            log.debug(err);
                                            reject(err);
                                            // errors.push(err.error);
                                            // reject({errors:errors});

                                        });


                                    }

                                } else {
                                    error = me.i18n.__('recipe is not defined.');
                                    errors.push(error);
                                    reject({errors:errors});
                                }
                            });
                        } else {
                            error = me.i18n.__('The line %s has job.', theLine.ident);
                            errors.push(error);
                            reject({errors:errors});
                        }
                    } else {
                        error = me.i18n.__('The line is empty.');
                        errors.push(error);
                        reject({errors:errors});
                    }


                });
            }
            else {
                error = me.i18n.__('lineId is not set');
                errors.push(error);
                reject({errors:errors});
            }
        }
    });

};
ProduceController.prototype._startJob = function (job) {
    var rcvBinNo = -1;
    var sndBinNo = -1;
    var weightTotal = job.targetWeight;
    var me = this;

    return new Promise(function (resolve, reject) {
        job.getLine().then(function (theLine) {
            theLine.getSections({where: {
                category: SectionCategory.DataHolding
            }}).then(function (sections) {
                if (!sections) {
                    reject({error: me.i18n.__('sections are not found.')});
                } else {
                    var promises = [];
                    var firstSection = sections[0];
                    if (firstSection && firstSection.state == GcsState.Passive) {
                        var jobIdNodeId = firstSection.nodeId + '.Parameter.JobId';
                        var rcvBinNoNodeId = firstSection.nodeId + '.Parameter.RcvBinNo';
                        var sndBinNoNodeId = firstSection.nodeId + '.Parameter.SndBinNos';
                        var weightTotalNodeId = firstSection.nodeId + '.Parameter.WeightTotals';
                        var data = {
                            type: DataType.Int16,
                            value: null
                        };
                        data.value = job.id;
                        var promise1_1 = new Promise(function (resolve1, reject1) {
                            me.gcObjectAdapter.setItemValue(jobIdNodeId, data, function (error) {
                                if (!error) {
                                    var info = me.i18n.__('write successfully: ' + jobIdNodeId);
                                    // firstSection.update({
                                    //     state: GcsState.Active,
                                    //     jobIdent: job.ident
                                    // }).then(function (theSection) {
                                    //     if (theSection) {
                                    //         me.emit('sectionStateChanged', {
                                    //             lineId: theSection.id,
                                    //             newState: theSection.state,
                                    //             displayState: me.i18n.__(myUtils.getDisplayState(GcsState, theSection.state))
                                    //         });
                                    //     }
                                    //     else {
                                    //         console.log('updated section ')
                                    //     }
                                    //
                                    // });
                                    resolve1({info: info});
                                } else {
                                    var errorTran = me.i18n.__(error);
                                    reject1({error: errorTran});

                                }
                            });
                        });
                        promises.push(promise1_1);
                        var promise1_2 = new Promise(function (resolve1, reject1) {
                            Recipe.findOne({
                                where: {JobId: job.id}
                            }).then(function (recipe) {
                                if (recipe) {
                                    data = {
                                        type: DataType.Int16,
                                        value: false
                                    };
                                    recipe.getSenders().then(function (ingredients) {
                                        var sender = null;
                                        var receiver = null;
                                        if (!ingredients) {
                                            reject1({error: i18n.__('ingredients are not found.')})
                                        }
                                        var sndBinNos = [];
                                        var sndTargetWeights = [];
                                        ingredients.forEach(function (ingredient) {
                                            if (ingredient) {
                                                if (ingredient.category === 0) {
                                                    sender = ingredient;
                                                    sndBinNos.push(ingredient.storageIdent);
                                                    sndTargetWeights[ingredient.storageIdent] = ingredient.targetWeight;
                                                } else {
                                                    receiver = ingredient;
                                                }
                                            }

                                        });
                                        var promises2 = [];
                                        data = {
                                            type: DataType.String,
                                            value: sndBinNos.join(',')
                                        };
                                        var promise2_1 = new Promise(function (resolve2, reject2) {
                                            me.gcObjectAdapter.setItemValue(sndBinNoNodeId, data, function (error) {
                                                if (!error) {
                                                    var info = me.i18n.__('write successfully: ' + sndBinNoNodeId);
                                                    resolve2({info: info});
                                                } else {
                                                    var errorTran = me.i18n.__(error);
                                                    reject2({error: errorTran});
                                                }
                                            });
                                        });
                                        promises2.push(promise2_1);
                                        var promise2_2 = new Promise(function (resolve2, reject2) {
                                            data.value = sndTargetWeights.join(',');
                                            me.gcObjectAdapter.setItemValue(weightTotalNodeId, data, function (error) {
                                                if (!error) {
                                                    var info = me.i18n.__('write successfully: ' + weightTotalNodeId);
                                                    resolve2({info: info});
                                                } else {
                                                    var errorTran = me.i18n.__(error);
                                                    reject2({error: errorTran});
                                                }
                                            });
                                        });
                                        promises2.push(promise2_2);
                                        var promise2_3 = new Promise(function (resolve2, reject2) {
                                            data.value = receiver.storageIdent;
                                            me.gcObjectAdapter.setItemValue(rcvBinNoNodeId, data, function (error) {
                                                if (!error) {
                                                    var info = me.i18n.__('write successfully: ' + rcvBinNoNodeId);
                                                    resolve2({info: info});
                                                } else {
                                                    var errorTran = me.i18n.__(error);
                                                    log.debug('transportController: _startJob: promise2_2: reject: '+ errorTran);
                                                    reject2({error: errorTran});
                                                }
                                            });
                                        });
                                        promises2.push(promise2_3);
                                        Promise.all(promises2).then(function (res) {
                                            resolve1(res);

                                        }, function (err) {
                                            reject1(err);
                                        });

                                    });

                                }
                                else {
                                    reject1({error: me.i18n.__('recipe is not found.')});
                                }

                            });
                        });
                        promises.push(promise1_2);
                        Promise.all(promises).then(function (res) {
                            JobLog.findOne({
                                where: {
                                    jobIdent: job.ident
                                }
                            }).then(function (theJobLog) {
                                if (!theJobLog) {
                                    JobLog.create({
                                        ident: job.ident,
                                        jobIdent: job.ident,
                                        lineIdent: job.lineIdent
                                    }).then(function (newJobLog) {

                                    });
                                }
                            });
                            resolve(res);

                        }, function (err) {
                            reject(err);
                        });

                    } else {
                        reject({error: me.i18n.__('section is not found. or has active job')})
                    }
                }


            });


        });
    });


};
ProduceController.prototype.lineStateChangeCallback = function (theLine, options) {
    var me = this;
    if (options) {
        if (options.newState === GcsState.Active) {
            if (theLine) {
                if (!theLine.previousState || theLine.previousState === GcsState.Passive) {
                    theLine.previousState = theLine.state;
                    theLine.state = options.newState;
                    theLine.save();
                    me.emit('lineStateChanged', {
                        lineId: theLine.id,
                        newState: theLine.state,
                        displayState: me.i18n.__(myUtils.getDisplayState(GcsState, theLine.state))
                    });
                }
            }
        }
        if (options.newState === GcsState.Emptying) {
            if (theLine) {
                if (theLine.previousState === GcsState.Active) {
                    theLine.previousState = theLine.state;
                    theLine.state = options.newState;
                    theLine.save();
                }
            }
        }
        if (options.newState === GcsState.Passive) {
            if (theLine) {
                if (theLine.previousState === GcsState.Emptying) {
                    theLine.previousState = theLine.state;
                    theLine.state = options.newState;
                    theLine.save();
                }
            }
        }
    }
};
ProduceController.prototype.sectionStateChangeCallback = function (theSection, options) {
    var me = this;
    if (options) {
        if (options.newState === GcsState.Active) {
            if (theSection) {
                if (!theSection.previousState || theSection.previousState === GcsState.Passive) {
                    if (options.jobId) {
                        Job.findOne({where: {id: options.jobId}}).then(function (theJob) {
                            theSection.jobIdent = theJob.ident;
                            theSection.previousState = theSection.state;
                            theSection.state = options.newState;
                            theSection.save();
                            me.emit('sectionStateChanged', {
                                lineId: theSection.id,
                                newState: theSection.state,
                                displayState: me.i18n.__(myUtils.getDisplayState(GcsState, theSection.state))
                            });
                            if (theSection.category === SectionCategory.Dosing) {
                                theJob.state = JobState.HandAdd;
                            }
                            if (theSection.category === SectionCategory.Mixing) {
                                theJob.state = JobState.Mixing;
                            }
                            if (theSection.category === SectionCategory.Packing) {
                                theJob.state = JobState.Packing;
                            }
                            if (theSection.category === SectionCategory.Palleting) {
                                theJob.state = JobState.Palleting;
                            }
                            theJob.save();
                            me.emit('jobStateChanged', {
                                lineId: theJob.id,
                                newState: theJob.state,
                                displayState: me.i18n.__(myUtils.getDisplayState(JobState, theJob.state))
                            });
                        })
                    }
                }
            }
        }
        if (options.newState === GcsState.Emptying) {
            if (theSection) {
                if (theSection.previousState === GcsState.Active) {
                    theSection.previousState = theSection.state;
                    theSection.state = options.newState;
                    theSection.save();
                }
            }
        }
        if (options.newState === GcsState.Passive) {
            if (theSection) {
                if (theSection.previousState === GcsState.Emptying) {
                    theSection.previousState = theSection.state;
                    theSection.state = options.newState;
                    theSection.save();
                }
            }
        }
    }

};
module.exports = ProduceController;