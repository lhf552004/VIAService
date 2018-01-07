/**
 * Created by pi on 8/25/16.
 */
/**
 * Created by pi on 8/19/16.
 */
"use strict";
require("requirish")._(module);
var fs = require("fs");
// var treeify = require('treeify');
var _ = require("underscore");
// var colors = require("colors");
var util = require("util");
// var Table = require('easy-table');
var async = require("async");
var utils = require('node-opcua/lib/misc/utils');
var assert = require("better-assert");
var opcua = require("node-opcua");
var VariableIds = opcua.VariableIds;
var log = require('./log');
var securityMode = opcua.MessageSecurityMode.get("NONE");
var GcObject = require('../models/eq/GcObject');
var Promise = require('promise');
if (!securityMode) {
    throw new Error("Invalid Security mode , should be " + opcua.MessageSecurityMode.enums.join(" "));
}
var securityPolicy = opcua.SecurityPolicy.get("None");
if (!securityPolicy) {
    throw new Error("Invalid securityPolicy , should be " + opcua.SecurityPolicy.enums.join(" "));
}
var timeout = 20000;

console.log("securityMode        = ".cyan, securityMode.toString());
console.log("securityPolicy      = ".cyan, securityPolicy.toString());
console.log("timeout             = ".cyan, timeout ? timeout : " Infinity ");

var client = null;

// var endpointUrl = argv.endpoint;
var endpointUrl = 'opc.tcp://localhost:26543';


var the_session = null;
var the_subscription = null;

var AttributeIds = opcua.AttributeIds;
var DataType = opcua.DataType;

var NodeCrawler = opcua.NodeCrawler;


var serverCertificate = null;

var path = require("path");
var crypto_utils = require("node-opcua/lib/misc/crypto_utils");


function w(str, l) {
    return (str + "                                      ").substr(0, l);
}

function __dumpEvent(session, fields, eventFields, _callback) {

    assert(_.isFunction(_callback));

    console.log("-----------------------");

    async.forEachOf(eventFields, function (variant, index, callback) {

        assert(_.isFunction(callback));
        if (variant.dataType === DataType.Null) {
            return callback();
        }
        if (variant.dataType === DataType.NodeId) {

            getBrowseName(session, variant.value, function (err, name) {

                if (!err) {
                    console.log(w(name, 20), w(fields[index], 15).yellow,
                        w(variant.dataType.key, 10).toString().cyan, name.cyan.bold, "(", w(variant.value, 20), ")");
                }
                callback();
            });

        } else {
            setImmediate(function () {
                console.log(w("", 20), w(fields[index], 15).yellow,
                    w(variant.dataType.key, 10).toString().cyan, variant.value);
                callback();
            })
        }
    }, _callback);
}

var q = new async.queue(function (task, callback) {
    __dumpEvent(task.session, task.fields, task.eventFields, callback);
});

function dumpEvent(session, fields, eventFields, _callback) {

    q.push({
        session: session, fields: fields, eventFields: eventFields, _callback: _callback
    });

}

function enumerateAllConditionTypes(the_session, callback) {

    var tree = {};

    var conditionEventTypes = {};

    function findAllNodeOfType(tree, typeNodeId, browseName, callback) {
        console.log('typeNodeId:' + typeNodeId + ' browseName: ' + browseName);
        var browseDesc1 = {
            nodeId: typeNodeId,
            referenceTypeId: opcua.resolveNodeId("HasSubtype"),
            browseDirection: opcua.browse_service.BrowseDirection.Forward,
            includeSubtypes: true,
            resultMask: 63

        };
        var browseDesc2 = {
            nodeId: typeNodeId,
            referenceTypeId: opcua.resolveNodeId("HasTypeDefinition"),
            browseDirection: opcua.browse_service.BrowseDirection.Inverse,
            includeSubtypes: true,
            resultMask: 63

        };
        var browseDesc3 = {
            nodeId: typeNodeId,
            referenceTypeId: opcua.resolveNodeId("HasTypeDefinition"),
            browseDirection: opcua.browse_service.BrowseDirection.Forward,
            includeSubtypes: true,
            resultMask: 63

        };

        var nodesToBrowse = [
            browseDesc1,
            browseDesc2,
            browseDesc3
        ];
        the_session.browse(nodesToBrowse, function (err, browseResults) {

            //xx console.log(" exploring".yellow ,browseName.cyan, typeNodeId.toString());
            tree[browseName] = {};
            if (!err) {
                browseResults[0].references = browseResults[0].references || [];
                async.forEach(browseResults[0].references, function (el, _inner_callback) {
                    conditionEventTypes[el.nodeId.toString()] = el.browseName.toString();
                    findAllNodeOfType(tree[browseName], el.nodeId, el.browseName.toString(), _inner_callback);
                }, callback);
            } else {
                callback(err);
            }
        });
    }

    var typeNodeId = opcua.resolveNodeId("ConditionType");
    findAllNodeOfType(tree, typeNodeId, "ConditionType", function (err) {
        if (!err) {
            return callback(null, conditionEventTypes, tree);
        }
        callback(err);
    });
}


function enumerateAllAlarmAndConditionInstances(the_session, callback) {

    var conditions = {};

    var found = [];

    function isConditionEventType(nodeId) {
        return conditions.hasOwnProperty(nodeId.toString());
        //x return derivedType.indexOf(nodeId.toString()) >=0;
    }

    function exploreForObjectOfType(session, nodeId, callback) {


        var q = async.queue(function worker(element, callback) {

            console.log(" exploring elements,", element.nodeId.toString());
            var browseDesc1 = {
                nodeId: element.nodeId,
                referenceTypeId: opcua.resolveNodeId("HierarchicalReferences"),
                browseDirection: opcua.browse_service.BrowseDirection.Forward,
                includeSubtypes: true,
                nodeClassMask: 0x1, // Objects
                resultMask: 63
            };

            var nodesToBrowse = [browseDesc1];
            session.browse(nodesToBrowse, function (err, browseResults) {
                if (err) {
                    console.log("err =", err);
                }
                if (!err) {
                    browseResults[0].references.forEach(function (ref) {
                        if (isConditionEventType(ref.typeDefinition)) {
                            //
                            var alarm = {
                                parent: element.nodeId,
                                browseName: ref.browseName,
                                alarmNodeId: ref.nodeId,
                                typeDefinition: ref.typeDefinition,
                                typeDefinitionName: conditions[ref.typeDefinition.toString()]
                            };
                            found.push(alarm);

                        } else {
                            q.push({nodeId: ref.nodeId});
                        }
                    });
                }
                callback(err);
            });

        });
        q.push({
            nodeId: nodeId
        });
        q.drain = function () {
            callback();
        };

    }

    enumerateAllConditionTypes(the_session, function (err, map) {
        conditions = map;
        exploreForObjectOfType(the_session, opcua.resolveNodeId("RootFolder"), function (err) {
            if (!err) {
                return callback(null, found);
            }
            return callback(err);
        })
    });

}

function monitorAlarm(subscription, alarmNodeId, callback) {

    assert(_.isFunction(callback));

    function callConditionRefresh(subscription, callback) {

        var the_session = subscription.publish_engine.session;
        var subscriptionId = subscription.subscriptionId;
        assert(_.isFinite(subscriptionId), "May be subscription is not yet initialized");
        assert(_.isFunction(callback));

        var conditionTypeNodeId = opcua.resolveNodeId("ConditionType");

        var browsePath = [
            opcua.browse_service.makeBrowsePath(conditionTypeNodeId, ".ConditionRefresh")
        ];
        var conditionRefreshId = opcua.resolveNodeId("ConditionType_ConditionRefresh");

        //xx console.log("browsePath ", browsePath[0].toString({addressSpace: server.engine.addressSpace}));

        async.series([

            // find conditionRefreshId
            function (callback) {
                the_session.translateBrowsePath(browsePath, function (err, results) {
                    if (!err) {
                        if (results[0].targets.length > 0) {
                            conditionRefreshId = results[0].targets[0].targetId;
                        } else {
                            // cannot find conditionRefreshId
                            console.log("cannot find conditionRefreshId", results[0].toString());
                            err = new Error(" cannot find conditionRefreshId");
                        }
                    }
                    callback(err);
                });
            },
            function (callback) {

                var methodsToCall = [{
                    objectId: conditionTypeNodeId,
                    methodId: conditionRefreshId,
                    inputArguments: [
                        new opcua.Variant({dataType: opcua.DataType.UInt32, value: subscriptionId})
                    ]
                }];

                the_session.call(methodsToCall, function (err, results) {
                    if (err) {
                        return callback(err);
                    }
                    if (results[0].statusCode !== opcua.StatusCodes.Good) {
                        return callback(new Error("Error " + results[0].statusCode.toString()));
                    }
                    callback();
                });
            }
        ], callback);
    }

    callConditionRefresh(subscription, function (err) {
        callback();
    });
}
function monitor_a_variable_node_value(monitored_node, callback) {

    var count = 0;
    // ---------------------------------------------------------------
    //  monitor a variable node value
    // ---------------------------------------------------------------
    var monitoredItem = the_subscription.monitor(
        {
            nodeId: monitored_node,
            attributeId: AttributeIds.Value
        },
        {
            clientHandle: 13,
            samplingInterval: 250,
            //xx filter:  { parameterTypeId: 'ns=0;i=0',  encodingMask: 0 },
            queueSize: 10000,
            discardOldest: true
        }
    );
    monitoredItem.on("initialized", function () {
        //log('D', "monitoredItem initialized");
        callback();

    });
    monitoredItem.on("changed", function (dataValue) {
        //log('D',monitoredItem.itemToMonitor.nodeId.toString(), " value has changed to " + dataValue.value.value);
        count++;
        if (count > 1) {
            callback(monitored_node, dataValue);
        }


    });
    monitoredItem.on("err", function (err_message) {
        log.error( monitoredItem.itemToMonitor.nodeId.toString() + ' ' + err_message);
        callback();
    });

}
var cmdManualNodeId = 'ns=1;s=PLC1.Element.SimpleMotor.=A-0001-MXZ01.Commands.CmdManual';
var valInput1NodeId = 'ns=1;s=PLC1.Element.SimpleMotor.=A-0001-MXZ01.HardwareIO.ValInput1';
var staFaultNodeId = 'ns=1;s=PLC1.Element.SimpleMotor.=A-0001-MXZ01.States.StaFault';
var staStartingNodeId = 'ns=1;s=PLC1.Element.SimpleMotor.=A-0001-MXZ01.States.StaStarting';
var staStartedNodeId = 'ns=1;s=PLC1.Element.SimpleMotor.=A-0001-MXZ01.States.StaStarted';
var staStoppingNodeId = 'ns=1;s=PLC1.Element.SimpleMotor.=A-0001-MXZ01.States.StaStopping';
var staStoppedNodeId = 'ns=1;s=PLC1.Element.SimpleMotor.=A-0001-MXZ01.States.StaStopped';

var jobIdNodeId = 'ns=1;s=PLC1.Section.INT1S01.Parameter.JobId';
var rcvBinNoNodeId = 'ns=1;s=PLC1.Section.INT1S01.Parameter.RcvBinNo';
var sndBinNoNodeId = 'ns=1;s=PLC1.Section.INT1S01.Parameter.SndBinNo';
var weightTotalNodeId = 'ns=1;s=PLC1.Section.INT1S01.Parameter.WeightTotal';
var resetJobNodeId = 'ns=1;s=PLC1.Section.INT1S01.Commands.CmdJobReset';
var ints01StaFaultNodeId = 'ns=1;s=PLC1.Section.INT1S01.States.StaFault';
var ints01StaStartedNodeId = 'ns=1;s=PLC1.Section.INT1S01.States.StaStarted';
var ints01StaStartingNodeId = 'ns=1;s=PLC1.Section.INT1S01.States.StaStarting';
var ints01StaStoppedNodeId = 'ns=1;s=PLC1.Section.INT1S01.States.StaStopped';
var ints01StaStoppingNodeId = 'ns=1;s=PLC1.Section.INT1S01.States.StaStopping';

var int1StaFaultNodeId = 'ns=1;s=PLC1.Line.TRANS.INT1.States.StaFault';
var int1StaIdelingNodeId = 'ns=1;s=PLC1.Line.TRANS.INT1.States.StaIdeling';
var int1StaStartedNodeId = 'ns=1;s=PLC1.Line.TRANS.INT1.States.StaStarted';
var int1StaStartingNodeId = 'ns=1;s=PLC1.Line.TRANS.INT1.States.StaStarting';
var int1StaStoppedNodeId = 'ns=1;s=PLC1.Line.TRANS.INT1.States.StaStopped';
var int1StaStoppingNodeId = 'ns=1;s=PLC1.Line.TRANS.INT1.States.StaStopping';
var devicesToStart = [
    'A-0002-MXZ01',
    'A-0002-KFC01',
    'A-0001-MXZ01',
    'A-0003-MXZ01',
    'A-0003-KFC10',
    'A-0004-MXZ01',
    'A-0003-BZA19',
    'A-0003-BZA20',
    'A-0003-BZA21',
    'A-0003-BZA22',
    'A-0003-BST12',
    'A-1008-MXZ01',
    'A-0008-VLS01',
    'A-1019-MXZ01',
    'A-1019-KFC01',
    'A-1020-MXZ01'

];
var index = 0;
function startINT1DeviceSequ() {
    var ident = devicesToStart[index];
    GcObject.findOne({
        where: {ident: ident}
    }).then(function (theGcObject) {
        if (theGcObject) {
            startDevice(theGcObject.nodeId, theGcObject.category).then(function (error) {
                if(!error){
                    index++;
                    if(index<devicesToStart.length){
                        startINT1DeviceSequ();
                    }else {
                        devicesToStart.reverse();
                        index=0;
                    }

                }
            });
        }else{
            log.debug('Start INT1: gcObject not found: ' + ident);
        }
    })
}

var indexV =0;
function stopINT1DeviceSequ() {
    var ident = devicesToStart[indexV];
    GcObject.findOne({
        where: {ident: ident}
    }).then(function (theGcObject) {
        if (theGcObject) {
            stopDevice(theGcObject.nodeId, theGcObject.category).then(function (error) {
                if(!error){
                    indexV++;
                    if(indexV<devicesToStart.length){
                        stopINT1DeviceSequ();
                    }else {
                        devicesToStart.reverse();
                        devicesToStart.pop();
                        devicesToStart.pop();
                        indexV=0;
                    }

                }else{
                    log.debug('Stop device error: ' + error);
                }
            });
        }else {
           log.debug('Stop INT1: gcObject not found: ' + ident);
        }
    })
}
function startDevice(elementNodeId, category) {
    return new Promise(function (resolve, reject) {
        switch (category) {
            case 'BeltMonitor':
            case 'SpeedMonitor':
                startBeltMonitor(elementNodeId).then(function (data) {
                    resolve();
                },function (error) {
                    reject();
                });
                break;
            case 'FilterControl':
            case 'SimpleMotor':
                startSimpleMotor(elementNodeId).then(function (data) {
                    resolve();
                },function (error) {
                    reject();
                });
                break;
            case 'ValveOpenClose':
                startValveOpenClose(elementNodeId).then(function (data) {
                    resolve();
                },function (error) {
                    reject();
                });
                break;
            case 'HighLevel':
            case 'LowLevel':
                startHighLevel(elementNodeId).then(function (data) {
                    resolve();
                },function (error) {
                    reject();
                });
                break;
        }
    });

}
function startSimpleMotor(elementNodeId) {
    var data = {
        type: DataType.Boolean,
        value: true
    };
    return new Promise(function (reolve, reject) {
        var faultNodeId = elementNodeId + '.States.StaFault';
        var stoppingNodeId = elementNodeId + '.States.StaStopping';
        var stoppedNodeId = elementNodeId + '.States.StaStopped';
        var startingNodeId = elementNodeId + '.States.StaStarting';
        var startedNodeId = elementNodeId + '.States.StaStarted';
        getItemsValue(faultNodeId, function (err, nodeIds, dataValue) {
            if (!err) {
                //no error
                if (!dataValue.value.value) {
                    data.value = true;
                    setItemValue(startingNodeId, data, function () {
                        setTimeout(function () {
                            data.value = false;
                            setItemValue(stoppingNodeId, data, function () {
                            });
                            setItemValue(stoppedNodeId, data, function () {
                            });
                            setItemValue(startingNodeId, data, function () {
                                setTimeout(function () {
                                    data.value = true;
                                    setItemValue(startedNodeId, data, function () {
                                        reolve();
                                    });
                                }, 2000);

                            });


                        }, 2000);
                    });
                }
                else {
                    reject({error: 'device still has fault.'});
                }
            }
            else {
                reject({error: 'read fault node error'});
            }
        });

    });
}
function startFilterControl() {

}

function startBeltMonitor(elementNodeId) {
    var data = {
        type: DataType.Boolean,
        value: true
    };
    return new Promise(function (reolve, reject) {
        var faultedNodeId = elementNodeId + '.States.StaFaulted';
        var healthyNodeId = elementNodeId + '.States.StaHealty';
        getItemsValue(faultedNodeId, function (err, nodeIds, dataValue) {
            if (!err) {
                //no error
                if (!dataValue.value.value) {
                    data.value = true;
                    setItemValue(healthyNodeId, data, function () {
                        reolve();
                    });
                }
                else {
                    data.value = false;
                    setItemValue(healthyNodeId, data, function () {
                    });
                    reject({error: 'device still has fault.'});
                }
            }
            else {
                reject({error: 'read fault node error'});
            }
        });

    });
}
function startSpeedMonitor() {

}
function startValveOpenClose(elementNodeId) {
    var data = {
        type: DataType.Boolean,
        value: true
    };
    return new Promise(function (reolve, reject) {
        var faultNodeId = elementNodeId + '.States.StaFault';
        var closingNodeId = elementNodeId + '.States.StaClosing';
        var closedNodeId = elementNodeId + '.States.StaClosed';
        var openingNodeId = elementNodeId + '.States.StaOpening';
        var openedNodeId = elementNodeId + '.States.StaOpened';
        getItemsValue(faultNodeId, function (err, nodeIds, dataValue) {
            if (!err) {
                //no error
                if (!dataValue.value.value) {
                    data.value = true;
                    setItemValue(openingNodeId, data, function () {
                        setTimeout(function () {
                            data.value = false;
                            setItemValue(closingNodeId, data, function () {
                            });
                            setItemValue(closedNodeId, data, function () {
                            });
                            setItemValue(openingNodeId, data, function () {
                                setTimeout(function () {
                                    data.value = true;
                                    setItemValue(openedNodeId, data, function () {
                                        reolve();
                                    });
                                }, 2000);

                            });


                        }, 2000);
                    });
                }
                else {
                    reject({error: 'device still has fault.'});
                }
            }
            else {
                reject({error: 'read fault node error'});
            }
        });

    });
}

function startHighLevel(elementNodeId) {
    var data = {
        type: DataType.Boolean,
        value: true
    };
    return new Promise(function (reolve, reject) {
        var faultNodeId = elementNodeId + '.States.StaFaulted';
        var coverNodeId = elementNodeId + '.States.StaCover';
        var coveredNodeId = elementNodeId + '.States.StaCovered';
        var uncoverNodeId = elementNodeId + '.States.StaUncover';
        var uncoveredNodeId = elementNodeId + '.States.StaUncovered';
        getItemsValue(faultNodeId, function (err, nodeIds, dataValue) {
            if (!err) {
                //no error
                if (!dataValue.value.value) {
                    data.value = true;
                    setItemValue(coverNodeId, data, function () {
                        setTimeout(function () {
                            data.value = false;
                            setItemValue(uncoverNodeId, data, function () {
                            });
                            setItemValue(uncoveredNodeId, data, function () {
                            });
                            setItemValue(coverNodeId, data, function () {
                            });
                            data.value = true;
                            setItemValue(coveredNodeId, data, function () {
                                reolve();
                            });
                        }, 2000);
                    });
                }
                else {
                    reject({error: 'device still has fault.'});
                }
            }
            else {
                reject({error: 'read fault node error'});
            }
        });

    });
}

//simulaion for stop INT1-------------------------------------------
function stopDevice(elementNodeId, category) {
    log.debug('stop device: ' + elementNodeId);
    return new Promise(function (resolve, reject) {
        switch (category) {
            case 'BeltMonitor':
            case 'SpeedMonitor':
                stopBeltMonitor(elementNodeId).then(function (data) {
                    resolve();
                },function (error) {
                    reject();
                });
                break;
            case 'FilterControl':
            case 'SimpleMotor':
                stopSimpleMotor(elementNodeId).then(function (data) {
                    resolve();
                },function (error) {
                    reject();
                });
                break;
            case 'ValveOpenClose':
                stopValveOpenClose(elementNodeId).then(function (data) {
                    resolve();
                },function (error) {
                    reject();
                });
                break;
            case 'HighLevel':
            case 'LowLevel':
                stopHighLevel(elementNodeId).then(function (data) {
                    resolve();
                },function (error) {
                    reject();
                });
                break;
        }
    });

}
function stopSimpleMotor(elementNodeId) {
    var data = {
        type: DataType.Boolean,
        value: true
    };
    return new Promise(function (reolve, reject) {
        var faultNodeId = elementNodeId + '.States.StaFault';
        var stoppingNodeId = elementNodeId + '.States.StaStopping';
        var stoppedNodeId = elementNodeId + '.States.StaStopped';
        var startingNodeId = elementNodeId + '.States.StaStarting';
        var startedNodeId = elementNodeId + '.States.StaStarted';
        data.value = true;
        setItemValue(stoppingNodeId, data, function (err) {
            if(!err){
                setTimeout(function (err1) {
                    if(!err1){
                        data.value = false;
                        setItemValue(startedNodeId, data, function () {
                        });
                        setItemValue(startingNodeId, data, function () {
                        });
                        setItemValue(stoppingNodeId, data, function () {
                            setTimeout(function () {
                                data.value = true;
                                setItemValue(stoppedNodeId, data, function () {
                                    reolve();
                                });
                            }, 2000);

                        });
                    }else {
                        reject(err1);
                    }



                }, 2000);
            }else {
                reject(err);
            }

        });

    });
}
function stopFilterControl() {

}

function stopBeltMonitor(elementNodeId) {
    var data = {
        type: DataType.Boolean,
        value: true
    };
    return new Promise(function (reolve, reject) {
        var faultedNodeId = elementNodeId + '.States.StaFaulted';
        var healthyNodeId = elementNodeId + '.States.StaHealty';
        data.value = false;
        setItemValue(healthyNodeId, data, function () {
            reolve();
        });

    });
}
function stopSpeedMonitor() {

}
function stopValveOpenClose(elementNodeId) {
    var data = {
        type: DataType.Boolean,
        value: true
    };
    return new Promise(function (reolve, reject) {
        var faultNodeId = elementNodeId + '.States.StaFault';
        var closingNodeId = elementNodeId + '.States.StaClosing';
        var closedNodeId = elementNodeId + '.States.StaClosed';
        var openingNodeId = elementNodeId + '.States.StaOpening';
        var openedNodeId = elementNodeId + '.States.StaOpened';
        data.value = true;
        setItemValue(closingNodeId, data, function () {
            setTimeout(function () {
                data.value = false;
                setItemValue(openingNodeId, data, function () {
                });
                setItemValue(openedNodeId, data, function () {
                });
                setItemValue(closingNodeId, data, function () {
                    setTimeout(function () {
                        data.value = true;
                        setItemValue(closedNodeId, data, function () {
                            reolve();
                        });
                    }, 2000);

                });


            }, 2000);
        });

    });
}

function stopHighLevel(elementNodeId) {
    var data = {
        type: DataType.Boolean,
        value: true
    };
    return new Promise(function (reolve, reject) {
        var faultNodeId = elementNodeId + '.States.StaFaulted';
        var coverNodeId = elementNodeId + '.States.StaCover';
        var coveredNodeId = elementNodeId + '.States.StaCovered';
        var uncoverNodeId = elementNodeId + '.States.StaUncover';
        var uncoveredNodeId = elementNodeId + '.States.StaUncovered';
        getItemsValue(faultNodeId, function (err, nodeIds, dataValue) {
            if (!err) {
                //no error
                if (!dataValue.value.value) {
                    data.value = true;
                    setItemValue(uncoverNodeId, data, function () {
                        setTimeout(function () {
                            data.value = false;
                            setItemValue(coverNodeId, data, function () {
                            });
                            setItemValue(coveredNodeId, data, function () {
                            });
                            setItemValue(uncoverNodeId, data, function () {
                            });
                            setItemValue(uncoveredNodeId, data, function () {
                                reolve();
                            });
                        }, 2000);
                    });
                }
                else {
                    reject({error: 'device still has fault.'});
                }
            }
            else {
                reject({error: 'read fault node error'});
            }
        });

    });
}

function monitor_node_callback(monitored_node, dataValueOfMonitor) {

    var data = {
        type: DataType.Boolean,
        value: true
    };
    if (monitored_node === 'ns=1;s=PLC1.Element.SimpleMotor.=A-0001-MXZ01.HardwareIO.ValInput1') {
        log.debug('monitored_node: ' + monitored_node);
        getItemsValue(staFaultNodeId, function (err, nodeIds, dataValue) {
            if (!err) {
                //no error
                if (!dataValue.value.value) {
                    if (dataValueOfMonitor.value.value === true) {
                        data.value = true;
                        setItemValue(staStartingNodeId, data, function () {
                            setTimeout(function () {
                                data.value = false;
                                setItemValue(staStoppingNodeId, data, function () {
                                });
                                setItemValue(staStoppedNodeId, data, function () {
                                });
                                setItemValue(staStartingNodeId, data, function () {
                                    setTimeout(function () {
                                        data.value = true;
                                        setItemValue(staStartedNodeId, data, function () {
                                        });
                                    }, 3000);

                                });


                            }, 2000);
                        });

                    } else {
                        data.value = true;
                        setItemValue(staStoppingNodeId, data, function () {
                            setTimeout(function () {
                                data.value = false;
                                setItemValue(staStartingNodeId, data, function () {
                                });
                                setItemValue(staStartedNodeId, data, function () {
                                });
                                setItemValue(staStoppingNodeId, data, function () {
                                });
                                data.value = true;
                                setItemValue(staStoppedNodeId, data, function () {
                                });
                            }, 2000);
                        });

                    }

                } else {
                    log.debug('Element state is fault. ');
                }
            }
        });
    }

    if (monitored_node === jobIdNodeId) {
        log.debug('monitored_node: ' + monitored_node);
        getItemsValue(ints01StaFaultNodeId, function (err, nodeIds, dataValue) {
            if (!err) {
                //no error
                if (!dataValue.value.value) {
                    if (dataValueOfMonitor.value.value > -1) {
                        data.value = true;
                        setItemValue(ints01StaStartingNodeId, data, function () {
                            setTimeout(function () {
                                data.value = false;
                                setItemValue(ints01StaStoppingNodeId, data, function () {
                                });
                                setItemValue(ints01StaStoppedNodeId, data, function () {
                                });
                                setItemValue(ints01StaStartingNodeId, data, function () {
                                    setTimeout(function () {
                                        data.value = true;
                                        setItemValue(ints01StaStartedNodeId, data, function () {
                                        });
                                    }, 3000);

                                });


                            }, 2000);
                        });
                        setItemValue(int1StaStartingNodeId, data, function () {
                            setTimeout(function () {
                                data.value = false;
                                setItemValue(int1StaStoppingNodeId, data, function () {
                                });
                                setItemValue(int1StaStoppedNodeId, data, function () {
                                });
                                setItemValue(int1StaStartingNodeId, data, function () {
                                    setTimeout(function () {
                                        data.value = true;
                                        setItemValue(int1StaStartedNodeId, data, function () {
                                        });
                                    }, 3000);

                                });


                            }, 2000);
                        });
                        //start devices


                    } else {
                        log.debug('Element state is fault. ');
                    }
                }
            }
        });
    }

    if(monitored_node === rcvBinNoNodeId){
        var binNo = dataValueOfMonitor.value.value;
        if ( binNo=== 1) {
            devicesToStart.push('A-1011-MXZ01');
            devicesToStart.push('A-1011-KFC01');
        }else if(binNo === 2){
            devicesToStart.push('A-1017-MXZ01');
            devicesToStart.push('A-1017-KFC01');
        }else if(binNo ===3){
            devicesToStart.push('A-1018-MXZ01');
            devicesToStart.push('A-1018-KFC01');
        }
        startINT1DeviceSequ();
    }
    if (monitored_node === resetJobNodeId) {
        if(dataValueOfMonitor.value.value == true){
            log.debug('monitored_node: ' + monitored_node);
            data.value = true;

            setItemValue(ints01StaStoppingNodeId, data, function () {
                setTimeout(function () {
                    data.value = false;
                    setItemValue(ints01StaStartingNodeId, data, function () {
                    });
                    setItemValue(ints01StaStartedNodeId, data, function () {
                    });
                    setItemValue(ints01StaStoppingNodeId, data, function () {
                        setTimeout(function () {
                            data.value = true;
                            setItemValue(ints01StaStoppedNodeId, data, function () {
                            });
                        }, 3000);

                    });


                }, 2000);
            });
            setItemValue(int1StaStoppingNodeId, data, function () {
                setTimeout(function () {
                    data.value = false;
                    setItemValue(int1StaStartingNodeId, data, function () {
                    });
                    setItemValue(int1StaStartedNodeId, data, function () {
                    });
                    setItemValue(int1StaStoppingNodeId, data, function () {
                        setTimeout(function () {
                            data.value = true;
                            setItemValue(int1StaStoppedNodeId, data, function () {
                            });
                        }, 3000);

                    });


                }, 2000);
            });
            data.value = false;
            setItemValue(resetJobNodeId, data, function () {
            });
            //stop devices

            log.debug('devices to stop: ');
            log.debug(devicesToStart);
            stopINT1DeviceSequ();
        }

    }

}

async.series([
    // reconnect using the correct end point URL now
    function (callback) {

        var hexDump = require("node-opcua/lib/misc/utils").hexDump;
        console.log("Server Certificate :".cyan);
        console.log(hexDump(serverCertificate).yellow);

        var options = {
            securityMode: securityMode,
            securityPolicy: securityPolicy,
            serverCertificate: serverCertificate,
            defaultSecureTokenLifetime: 40000
        };
        console.log("Options = ", options.securityMode.toString(), options.securityPolicy.toString());

        client = new opcua.OPCUAClient(options);

        console.log(" connecting to ", endpointUrl.cyan.bold);
        client.connect(endpointUrl, callback);
    },

    //create session------------------------------------------
    function (callback) {

        var userIdentity = null; // anonymous
        // if (argv.userName && argv.password) {
        //
        //     userIdentity = {
        //         userName: argv.userName,
        //         password: argv.password
        //     };
        //
        // }
        client.createSession(userIdentity, function (err, session) {
            if (!err) {
                the_session = session;
                console.log(" session created".yellow);
                console.log(" sessionId : ", session.sessionId.toString());
            } else {
                console.log('err: ' + err);
            }
            callback(err);
        });
    },

    // -----------------------------------------
    // create subscription
    function (callback) {

        var parameters = {
            requestedPublishingInterval: 100,
            requestedLifetimeCount: 1000,
            requestedMaxKeepAliveCount: 12,
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 10
        };

        the_subscription = new opcua.ClientSubscription(the_session, parameters);

        function getTick() {
            return Date.now();
        }

        var t = getTick();

        the_subscription.on("started", function () {

            console.log("started subscription :", the_subscription.subscriptionId);

            console.log(" revised parameters ");
            console.log("  revised maxKeepAliveCount  ", the_subscription.maxKeepAliveCount, " ( requested ", parameters.requestedMaxKeepAliveCount + ")");
            console.log("  revised lifetimeCount      ", the_subscription.lifetimeCount, " ( requested ", parameters.requestedLifetimeCount + ")");
            console.log("  revised publishingInterval ", the_subscription.publishingInterval, " ( requested ", parameters.requestedPublishingInterval + ")");
            console.log("  suggested timeout hint     ", the_subscription.publish_engine.timeoutHint);

            callback();

        }).on("internal_error", function (err) {
            console.log(" received internal error", err.message);

        }).on("keepalive", function () {

            var t1 = getTick();
            var span = t1 - t;
            t = t1;
            //console.log("keepalive ", span / 1000, "sec", " pending request on server = ", the_subscription.publish_engine.nbPendingPublishRequests);

        }).on("terminated", function (err) {

        });
    },
    function MonitorAllNode(callback) {
        var prefix = 'ns=1;s=PLC1';
        var lines = [];
        var nodeId = '';
        var infos = [];
        var pathInfo = '';
        var type = '';
        var PLCPath = path.join(__dirname, '../../OPCUAServer/PLC.csv');
        log.debug(PLCPath);
        fs.readFile(PLCPath, 'utf8', function (err, data) {
            if (err) {
                log.error( err);
            }
            else {
                lines = data.split('\n');
                nodeId = 'ns=1;s=PLC1';
                //remove header
                lines.splice(0, 1);
                log.debug('lines length: ' + lines.length);
                lines.forEach(function (line) {

                    infos = [];
                    // log('D','line: ' + line);

                    if (line) {
                        //first info is path; second info is type
                        infos = line.split(',');
                    }

                    if (infos.length >= 2) {

                        pathInfo = infos[0];
                        type = infos[2];
                        //remove double quotes
                        pathInfo = prefix + '.' + pathInfo.substring(1, pathInfo.length - 1);
                        // log('D','pathInfo: ' + pathInfo);

                        monitor_a_variable_node_value(pathInfo, monitor_node_callback);

                    }
                });
            }

        });
        var data = {
            type: DataType.Boolean,
            value: false
        };
        setItemValue(cmdManualNodeId, data, function () {
        });
        setItemValue(staFaultNodeId, data, function () {
        });
        setItemValue(valInput1NodeId, data, function () {
        });
        setItemValue(staStartingNodeId, data, function () {
        });
        setItemValue(staStartedNodeId, data, function () {
        });
        setItemValue(staStoppingNodeId, data, function () {
        });
        data.value = true;
        setItemValue(staStoppedNodeId, data, function () {
        });
        // devicesToStart.reverse();
        // stopINT1DeviceSequ();
        // data.value = false;
        // setItemValue(ints01StaStartedNodeId, data, function () {
        // });



    },
    function Initiliaze(callback) {
        console.log('Last function.');
    }
], function (err) {

    if (err) {
        console.log(" client : process terminated with an error".red.bold);
        console.log(" error", err);
        console.log(" stack trace", err.stack);
        reject(err);
    } else {
        console.log("success !!   ");
        resolve(me);
    }

});


function getBrowseName(nodeId, callback) {
    the_session.read([{nodeId: nodeId, attributeId: AttributeIds.BrowseName}], function (err, org, readValue) {
        if (!err) {
            if (readValue[0].statusCode === opcua.StatusCodes.Good) {
                assert(readValue[0].statusCode === opcua.StatusCodes.Good);
                var browseName = readValue[0].value.value.name;
                return callback(null, browseName);
            }
        }
        callback(err, "<??>");
    })
};


function getItemsValue(nodeIds, callback) {
    the_session.readVariableValue(nodeIds, function (err, dataValue, diagnosticsInfo) {

        console.log(" --- read nodes---");
        if (!err) {
            callback(err, nodeIds, dataValue);
        } else {
            callback(err, null);
        }
        console.log(" -----------------------");

    });
}

function setItemValue(nodeId, data, callback) {
    var sourceTimestamp = new Date();
    var nodesToWrite = [{
        nodeId: nodeId,
        attributeId: AttributeIds.Value,
        indexRange: null,
        value: {
            value: {
                dataType: data.type,
                value: data.value

            },
            sourceTimestamp: sourceTimestamp,
            serverTimestamp: sourceTimestamp
        }
    }];
    the_session.write(nodesToWrite, function (err, statusCode, diagnosticInfo) {
        if (!err) {
            console.log(nodeId + " write ok: " + data.value);
            callback();
        } else {
            callback(err);
        }
    });
}


