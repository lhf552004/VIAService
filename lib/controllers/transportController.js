/**
 * Created by pi on 8/2/16.
 */
var util = require('util');
var myUtils = require('../utils');
var ControllerBase = require('./controllerBase');
var Recipe = require('../../models/pr/Recipe');
var JobLog = require('../../models/pr/JobLog');
var Job = require('../../models/pr/Job');
var Product = require('../../models/pr/Product');
var Line = require('../../models/eq/Line');
var DataType = require('node-opcua').DataType;
var GcsState = require('../stateAndCategory/gcsState');
var Storage = require('../../models/eq/Storage');
var JobState = require('../../lib/stateAndCategory/jobState');
var Promise = require('promise');
var GcsStateEnum = new Enum(GcsState);
var EventEmitter = require("events").EventEmitter;
var log = require('../log');

var TransportController = function (gcObjectAdapter, i18n, io) {
    this.i18n = i18n;
    this.gcObjectAdapter = gcObjectAdapter;
    this.io = io;
    this.category = 1;
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(10000);
    var me = this;

    // io.on('connection', function (socket) {
    //     console.log('eventEmitter: ');
    //     console.dir(me.eventEmitter);
    //     global.myEventEmitter.addListener('lineStateChanged', function (options) {
    //         console.log('TransportController: addListener: lineStateChanged: ' + options);
    //         socket.emit('lineStateChanged', options);
    //
    //     });
    //     global.myEventEmitter.addListener('sectionStateChanged', function (options) {
    //         log.debug('TransportController: addListener: sectionStateChanged');
    //         socket.emit('sectionStateChanged', options);
    //
    //     });
    //     global.myEventEmitter.addListener('jobStateChanged', function (options) {
    //         log.debug('TransportController: addListener: jobStateChanged');
    //         socket.emit('jobStateChanged', options);
    //
    //     });
    //
    // });
};
// util.inherits(TransportController, EventEmitter);
util.inherits(TransportController, ControllerBase);
TransportController.prototype._startJob = function (job) {
    var rcvBinNo = -1;
    var sndBinNo = -1;
    var weightTotal = job.targetWeight;
    var me = this;

    return new Promise(function (resolve, reject) {
        job.getLine().then(function (theLine) {
            theLine.getSections().then(function (sections) {
                var promises = [];
                var firstSection = sections[0];
                if (firstSection && firstSection.state == GcsState.Passive) {
                    var jobIdNodeId = firstSection.nodeId + '.Parameter.JobId';
                    var rcvBinNoNodeId = firstSection.nodeId + '.Parameter.RcvBinNo';
                    var sndBinNoNodeId = firstSection.nodeId + '.Parameter.SndBinNo';
                    var weightTotalNodeId = firstSection.nodeId + '.Parameter.WeightTotal';
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
                                log.debug('transportController: _startJob: promise1_1: reject: '+ errorTran);
                                reject1({error: errorTran});

                            }
                        });
                    });
                    promises.push(promise1_1);
                    data = {
                        type: DataType.Double,
                        value: weightTotal
                    };
                    var promise1_2 = new Promise(function (resolve1, reject1) {
                        me.gcObjectAdapter.setItemValue(weightTotalNodeId, data, function (error) {
                            if (!error) {
                                var info = me.i18n.__('write successfully: ' + weightTotalNodeId);
                                resolve1({info: info});
                            } else {
                                var errorTran = me.i18n.__(error);
                                log.debug('transportController: _startJob: promise1_2: reject: '+ errorTran);
                                reject1({error: errorTran});
                            }
                        });
                    });
                    promises.push(promise1_2);
                    var promise1_3 = new Promise(function (resolve1, reject1) {
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
                                    ingredients.forEach(function (ingredient) {
                                        if (ingredient) {
                                            if (ingredient.category === 0) {
                                                sender = ingredient;
                                            } else {
                                                receiver = ingredient;
                                            }
                                        }

                                    });
                                    if (sender && receiver) {
                                        var promises2 = [];
                                        var promise2_1 = new Promise(function (resolve2, reject2) {
                                            sender.getStorage().then(function (theStorage) {
                                                sndBinNo = parseInt(theStorage.ident);
                                                data.value = sndBinNo;
                                                me.gcObjectAdapter.setItemValue(sndBinNoNodeId, data, function (error) {
                                                    if (!error) {
                                                        var info = me.i18n.__('write successfully: ' + sndBinNoNodeId);
                                                        resolve2({info: info});
                                                    } else {
                                                        var errorTran = me.i18n.__(error);
                                                        log.debug('transportController: _startJob: promise2_1: reject: '+ errorTran);
                                                        reject2({error: errorTran});
                                                    }
                                                });

                                            });
                                        });
                                        promises2.push(promise2_1);
                                        var promise2_2 = new Promise(function (resolve2, reject2) {
                                            receiver.getStorage().then(function (theStorage) {
                                                rcvBinNo = parseInt(theStorage.ident);
                                                data.value = rcvBinNo;
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
                                        });
                                        promises2.push(promise2_2);
                                        Promise.all(promises2).then(function (res) {
                                            resolve1(res);

                                        }, function (err) {
                                            log.debug('transportController: _startJob: promise1_3: reject: '+ err);
                                            reject1(err);
                                        });
                                    }
                                    else {
                                        log.debug('transportController: _startJob: promise1_3: reject: no sender or reciver');
                                        reject1({error: me.i18n.__('sender or receiver is not found.')});
                                    }
                                });

                            }
                            else {
                                log.debug('transportController: _startJob: promise1_3: reject: recipe is not found.');
                                reject1({error: me.i18n.__('recipe is not found.')});
                            }

                        });
                    });
                    promises.push(promise1_3);
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
                        log.debug('transportController: _startJob: promise: resolve!!!');
                        resolve(res);

                    }, function (err) {
                        log.debug('transportController: _startJob: promise: reject: ' + err);
                        reject(err);
                    });

                } else {
                    log.debug('transportController: _startJob: promise: reject: section is not found');
                    reject({error: me.i18n.__('section is not found. or has active job')})
                }

            });


        });
    });


};
TransportController.prototype._stopJob = function (job) {
    var me = this;

    return new Promise(function (resolve, reject) {
        job.getLine().then(function (theLine) {
            theLine.getSections().then(function (sections) {
                var firstSection = sections[0];
                log.debug('firstSection: ');
                log.debug(firstSection);
                if (firstSection && firstSection.state !== GcsState.Passive) {

                    var resetJobNodeId = firstSection.nodeId + '.Commands.CmdJobReset';

                    var data = {
                        type: DataType.Boolean,
                        value: true
                    };

                    me.gcObjectAdapter.setItemValue(resetJobNodeId, data, function (error) {
                        if (!error) {
                            var info = me.i18n.__('write successfully: ' + resetJobNodeId);
                            // firstSection.update({
                            //     state: GcsState.Passive,
                            //     jobIdent: null
                            // }).then(function (theSection) {
                            //     if (theSection) {
                            //         me.io.on('connection', function (socket) {
                            //             socket.emit('sectionStateChanged', theSection.getJsonObject());
                            //         })
                            //     }
                            //     else {
                            //         console.log('updated section ')
                            //     }
                            //
                            // });
                            // job.update({
                            //     state: JobState.Done
                            // }).then(function (updatedJob) {
                            //     console.log("save successfully");
                            //
                            // });
                            console.log(info);
                            job.finishRegisterAssembly('WH');
                            resolve({info: info});
                        } else {
                            var errorTran = me.i18n.__(error);
                            reject({error: errorTran});

                        }
                    });


                } else {
                    var error = me.i18n.__('section is not found. or job has done');
                    reject({error: error})
                }

            });


        });
    });


};

TransportController.prototype._checkJob = function (job) {
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
                                        reject(errors);
                                    }
                                    else {
                                        theRecipe.getSenders().then(function (ingredients) {
                                            var sender = null;
                                            var receiver = null;
                                            ingredients.forEach(function (ingredient) {
                                                if (ingredient.category === 0) {
                                                    sender = ingredient;
                                                } else if (ingredient.category === 1) {
                                                    receiver = ingredient;
                                                }
                                            });

                                            me.checkSenderAndReceiver(sender, receiver, theLine.ident, errors).then(function () {
                                                console.log('check job is successful');
                                                resolve();
                                            }, function (errorsOfCheck) {
                                                console.log('check job is failed');
                                                console.log(errorsOfCheck);
                                                reject(errorsOfCheck);
                                            });

                                        });
                                    }

                                } else {
                                    error = me.i18n.__('recipe is not defined.');
                                    errors.push(error);
                                    reject(errors);
                                }
                            });
                        } else {
                            error = me.i18n.__('The line %s has job.', theLine.ident);
                            errors.push(error);
                            reject(errors);
                        }
                    } else {
                        error = me.i18n.__('The line is empty.');
                        errors.push(error);
                        reject(errors);
                    }


                });
            }
            else {
                error = me.i18n.__('target weight should be positive.');
                errors.push(error);
                reject(errors);
            }
        }
    });

};
TransportController.prototype.checkSenderAndReceiver = function (sender, receiver, lineIdent, errors) {
    var me = this;
    var error = '';
    return new Promise(function (resolve, reject) {
        if (sender) {
            Storage.findOne({
                where: {
                    id: sender.StorageId
                }
            }).then(function (theStorage) {
                if (theStorage) {

                    if (theStorage.category === 1) {
                        if (theStorage.lineIdent === lineIdent) {
                            me.checkReceiver(receiver, lineIdent, errors).then(function (data) {
                                console.log('receiver check is OK');
                                console.log(data);
                                resolve();
                            }, function (errorsOfRec) {
                                console.log('receiver check is failed');
                                console.log(errorsOfRec);
                                reject(errorsOfRec);
                            });
                        } else {
                            error = me.i18n.__('The gate storage is not correct of line, it should be %s', theLine.ident);
                            errors.push(error);
                            reject(errors);
                        }

                    } else {
                        error = me.i18n.__('Storage category is not correct. it should be %d', 1);
                        errors.push(error);
                        reject(errors);
                    }

                } else {
                    error = me.i18n.__('Storage of sender is not defined');
                    errors.push(error);
                    reject(errors);
                }
            })
        } else {
            error = me.i18n.__('Sender is not defined');
            errors.push(error);
            reject(errors);
        }
    });

};
TransportController.prototype.checkReceiver = function (receiver, lineIdent, errors) {
    var me = this;
    var error = '';

    return new Promise(function (resolve, reject) {
        if (receiver) {
            Storage.findOne({
                where: {
                    id: receiver.StorageId
                }
            }).then(function (theStorage) {
                if (theStorage) {
                    if (theStorage.category === 10) {
                        if (theStorage.ProductId === receiver.ProductId) {
                            theStorage.getProduct().then(function (theProduct) {
                                if (theProduct) {
                                    resolve();
                                } else {
                                    error = me.i18n.__('Product is not defined');
                                    errors.push(error);
                                    reject(errors);
                                }
                            });
                        } else {
                            error = me.i18n.__('Product is not matched between storage and ingredient');
                            errors.push(error);
                            reject(errors);
                        }
                    } else {
                        error = me.i18n.__('Storage category is not correct. it should be %d', 10);
                        errors.push(error);
                        reject(errors);
                    }
                } else {
                    error = me.i18n.__('Storage of receiver is not defined');
                    errors.push(error);
                    reject(errors);
                }
            });
        }
        else {
            error = me.i18n.__('receiver is not defined');
            errors.push(error);
            reject(errors);
        }
    });


};

TransportController.prototype.lineStateChangeCallback = function (theLine, options) {
    var me = this;
    if (options) {
        if (options.newState === GcsState.Active) {
            if (theLine) {
                if (!theLine.previousState || theLine.previousState === GcsState.Passive) {
                    theLine.previousState = theLine.state;
                    theLine.state = options.newState;
                    theLine.save();
                    me.eventEmitter.emit('lineStateChanged', {
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
                    me.eventEmitter.emit('lineStateChanged', {
                        lineId: theLine.id,
                        newState: theLine.state,
                        displayState: me.i18n.__(myUtils.getDisplayState(GcsState, theLine.state))
                    });
                }
            }
        }
        if (options.newState === GcsState.Passive) {
            if (theLine) {
                if (theLine.previousState === GcsState.Emptying) {
                    theLine.previousState = theLine.state;
                    theLine.state = options.newState;
                    theLine.save();
                    me.eventEmitter.emit('lineStateChanged', {
                        lineId: theLine.id,
                        newState: theLine.state,
                        displayState: me.i18n.__(myUtils.getDisplayState(GcsState, theLine.state))
                    });
                }
            }
        }
    }
};
TransportController.prototype.sectionStateChangeCallback = function (theSection, options) {
    var me = this;
    if (options) {
        if (options.newState === GcsState.Active) {
            if (theSection) {
                if (!theSection.previousState || theSection.previousState === GcsState.Passive || theSection.previousState === GcsState.Emptying) {
                    if (options.jobId) {
                        Job.findOne({where: {id: options.jobId}}).then(function (theJob) {
                            theSection.jobIdent = theJob.ident;
                            theSection.previousState = theSection.state;
                            theSection.state = options.newState;
                            theSection.save();
                            log.debug('TransportController: section State Changed to active, it need to update');
                            var sectionEventData = {
                                sectionId: theSection.id,
                                newState: theSection.state,
                                displayState: me.i18n.__(myUtils.getDisplayState(GcsState, theSection.state))
                            };
                            global.myEventEmitter.emit('sectionStateChanged', sectionEventData);
                            if(global.mySocket){
                                global.mySocket.emit('sectionStateChanged', sectionEventData);
                            }

                            theJob.state = JobState.Active;
                            theJob.save();
                            log.debug('TransportController: job State Changed to active, it need to update');
                            var jobEventData = {
                                jobId: theJob.id,
                                newState: theJob.state,
                                displayState: me.i18n.__(myUtils.getDisplayState(JobState, theJob.state))
                            };
                            global.myEventEmitter.emit('jobStateChanged', jobEventData);
                            if(global.mySocket){
                                log.debug('TransportController: socket emit jobStateChanged: ' + theJob.state);
                                global.mySocket.emit('jobStateChanged', jobEventData);
                            }
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
                    var sectionEventData = {
                        sectionId: theSection.id,
                        newState: theSection.state,
                        displayState: me.i18n.__(myUtils.getDisplayState(GcsState, theSection.state))
                    };
                    global.myEventEmitter.emit('sectionStateChanged', sectionEventData);
                    if(global.mySocket){
                        global.mySocket.emit('sectionStateChanged', sectionEventData);
                    }
                }
            }
        }
        if (options.newState === GcsState.Passive) {
            if (theSection) {
                log.debug('TransportController: section previous state: ' + theSection.previousState);
                var jobIdent = theSection.jobIdent;
                theSection.previousState = theSection.state;
                theSection.state = options.newState;
                theSection.jobIdent = null;
                theSection.save();
                log.debug('TransportController: section State Changed to passive, it need to update');

                global.myEventEmitter.emit('sectionStateChanged', {
                    sectionId: theSection.id,
                    newState: theSection.state,
                    displayState: me.i18n.__(myUtils.getDisplayState(GcsState, theSection.state))
                });
                if(global.mySocket){
                    global.mySocket.emit('sectionStateChanged', {
                        sectionId: theSection.id,
                        newState: theSection.state,
                        displayState: me.i18n.__(myUtils.getDisplayState(GcsState, theSection.state))
                    });
                }
                log.debug('TransportController: job State Changed to done, it need to update');
                Job.findOne({where:{ident: jobIdent}}).then(function (theJob) {
                    if(theJob){
                        theJob.state  =JobState.Done;
                        theJob.save();
                        global.myEventEmitter.emit('jobStateChanged', {
                            jobId: theJob.id,
                            newState: theJob.state,
                            displayState: me.i18n.__(myUtils.getDisplayState(JobState, theJob.state))
                        });
                        if(global.mySocket){
                            log.debug('TransportController: socket emit jobStateChanged: ' + theJob.state);
                            global.mySocket.emit('jobStateChanged', {
                                jobId: theJob.id,
                                newState: theJob.state,
                                displayState: me.i18n.__(myUtils.getDisplayState(JobState, theJob.state))
                            });
                        }

                    }
                });
                // if (theSection.previousState === GcsState.Emptying) {
                //
                // }


            }
        }
    }

};

module.exports = TransportController;