/**
 * Created by pi on 8/2/16.
 */
var controllerState = require('../stateAndCategory/controllerState');
var ControllerStateEnum = new Enum({
    Undefined: 0,
    Starting: 10,
    Running: 20,
    Error: 80
});
var Line = require('../../models/eq/Line');
var Storage = require('../../models/eq/Storage');
var Section = require('../../models/eq/Section');
var Promise = require('promise');
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var log = require('../log');
var ControllerBase = function () {
    this.gcObjectAdapter = null;
    this.state = ControllerStateEnum.Undefined;
};

ControllerBase.prototype.initialize = function () {
    var lineNodeId = '';
    var gcObjectParameter = {};
    var promises = [];
    var parentNodeId = '';
    var me = this;
    return new Promise(function (resolve, reject) {
        Line.findAll({
            where: {category: this.category}
        }).then(function (lines) {
            lines.forEach(function (line) {
                lineNodeId = line.nodeId;
                gcObjectParameter = line.getGcObjectParameter();
                me.readGcObject(this.gcObjectAdapter, gcObjectParameter, parentNodeId, lineNodeId, promises);
                Promise.all(promises).then(function (pRes) {
                    this.state = ControllerStateEnum.Starting;
                    resolve();
                }, function (err) {
                    this.state = ControllerStateEnum.Error;
                    reject(err);
                });
            });
        });
    });
};
ControllerBase.prototype.checkJob = function (job) {
    return this._checkJob(job);
};
ControllerBase.prototype.startJob = function (job) {
    return this._startJob(job);
};
ControllerBase.prototype.suspendJob = function () {

};
ControllerBase.prototype.stopJob = function (job) {
    return this._stopJob(job);
};

ControllerBase.prototype.readParameter = function (gcObjectAd, nodeId, gcObjectParameter, promises) {
    var promise = new Promise(function (resolve, reject) {
        gcObjectAd.getItemsValue(nodeId, function (err, theNodeId, data) {
            log.debug('nodeId: ' + nodeId);
            log.debug('theNodeId: ' + theNodeId);
            if (!err) {
                log.debug('value: ' + data.value.value);
                var pro = theNodeId.substring(theNodeId.lastIndexOf('.') + 1, theNodeId.length);
                log.debug('pro: ' + pro);
                gcObjectParameter[pro] = data.value.value;
                resolve(gcObjectParameter[pro]);
            }
            else {
                log.debug('error: ' + err);
                reject(err);
            }

        });
    });
    promises.push(promise);
};
ControllerBase.prototype.readGcObject = function (gcObjectAd, gcObjectParameter, parentNodeId, elementNodeId, promises) {
    var nodeId = '';
    for (var p in gcObjectParameter) {
        log.debug('Property  of gcObject: ' + p);
        if (gcObjectParameter.hasOwnProperty(p)) {
            log.debug(p + ' type: ' + typeof (gcObjectParameter[p]));
            if (!(typeof (gcObjectParameter[p]) === 'object') || Array.isArray(gcObjectParameter[p])) {

                nodeId = parentNodeId + '.' + p;
                this.readParameter(gcObjectAd, nodeId, gcObjectParameter, promises);

            } else {
                parentNodeId = elementNodeId + '.' + p;
                log.debug('parentNodeId: ' + parentNodeId);
                this.readGcObject(gcObjectAd, gcObjectParameter[p], parentNodeId, elementNodeId, promises);
            }
        }
    }


};
ControllerBase.prototype.checkGateStorageOrPackerIngredient = function (ingredient, lineIdent) {
    var me = this;
    var error = '';
    return new Promise(function (resolve, reject) {
        if (ingredient) {

            Storage.findOne({
                where: {
                    id: ingredient.StorageId
                }
            }).then(function (theStorage) {
                if (theStorage) {
                    console.log('category');
                    console.log(theStorage.category);

                    if(me.category === 0){
                        //produceController, ingredient's storage should be packer
                        if (theStorage.category === 3) {
                            if (theStorage.lineIdent === lineIdent) {
                                resolve();
                            } else {
                                error = me.i18n.__('The gate storage is not correct of line, it should be %s', lineIdent);
                                reject({error: error});
                            }

                        } else {
                            error = me.i18n.__('Storage category is not correct. it should be %d', 1);
                            reject({error: error});
                        }
                    }else if(me.category === 1 ){
                        //transportController, ingredient's storage should be gateStorage
                        if (theStorage.category === 1) {
                            if (theStorage.lineIdent === lineIdent) {
                                resolve();
                            } else {
                                error = me.i18n.__('The gate storage is not correct of line, it should be %s', lineIdent);
                                reject({error: error});
                            }

                        } else {
                            error = me.i18n.__('Storage category is not correct. it should be %d', 1);
                            reject({error: error});
                        }
                    }


                } else {
                    error = me.i18n.__('Storage of sender is not defined');
                    reject({error: error});
                }
            })
        } else {
            error = me.i18n.__('Sender is not defined');
            reject({error: error});
        }
    });

};

ControllerBase.prototype.checkStorageIngredient = function (ingredient) {
    var me = this;
    var error = '';

    return new Promise(function (resolve, reject) {
        if (ingredient) {
            log.debug('Storage: ' + ingredient.StorageId);
            Storage.findOne({
                where: {
                    id: ingredient.StorageId
                }
            }).then(function (theStorage) {
                if (theStorage) {
                    if (theStorage.category === 10) {
                        if (theStorage.ProductId === ingredient.ProductId) {
                            theStorage.getProduct().then(function (theProduct) {
                                if (theProduct) {
                                    resolve();
                                } else {
                                    error = me.i18n.__('Product is not defined');
                                    reject({error: error});
                                }
                            });
                        } else {
                            error = me.i18n.__('Product is not matched between storage and ingredient');
                            reject({error: error});
                        }
                    } else {
                        error = me.i18n.__('Storage category is not correct. it should be %d', 10);
                        reject({error: error});
                    }
                } else {
                    error = me.i18n.__('Storage of receiver is not defined: %d',ingredient.StorageId);
                    reject({error: error});
                }
            });
        }
        else {
            error = me.i18n.__('receiver is not defined');
            reject({error: error});
        }
    });


};

module.exports = ControllerBase;