/**
 * Created by pi on 8/19/16.
 */
"use strict";
require("requirish")._(module);
var fs = require("fs");
var treeify = require('treeify');
var _ = require("underscore");
var colors = require("colors");
var util = require("util");
var Table = require('easy-table');
var async = require("async");
var utils = require('node-opcua/lib/misc/utils');
var assert = require("better-assert");
var opcua = require("node-opcua");
var VariableIds = opcua.VariableIds;
var log = require('../log');
var securityMode = opcua.MessageSecurityMode.get("NONE");
var EventEmitter = require("events").EventEmitter;
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
// var endpointUrl = 'opc.tcp://bogon:26543';

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


var GcObjectAdapter = function () {
    var me = this;
    me.DataType = opcua.DataType;
    var Promise = require('promise');
    return new Promise(function (resolve, reject) {
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
            }

        ], function (err) {

            if (err) {
                console.log(" client : process terminated with an error".red.bold);
                console.log(" error", err);
                console.log(" stack trace", err.stack);
                reject(err);
            } else {
                console.log("gcObject series start success !!   ");
                resolve(me);
            }

        });


    });
};
util.inherits(GcObjectAdapter, EventEmitter);
GcObjectAdapter.prototype.getBrowseName = function (nodeId, callback) {
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


GcObjectAdapter.prototype.getItemValue = function (nodeId, callback) {
    var nodeIds = [nodeId];
    this.getItemsValue(nodeIds, function (err, nodesvalue) {
        callback(err, nodeIds, nodesvalue[0]);
    });
};
GcObjectAdapter.prototype.getItemsValue = function (nodeIds, callback) {
    the_session.readVariableValue(nodeIds, function (err, dataValue, diagnosticsInfo) {

        //console.log(" --- read nodes---");
        if (!err) {
            callback(err, nodeIds, dataValue);
        } else {
            callback(err, null);
        }
        //console.log(" -----------------------");

    });
};

GcObjectAdapter.prototype.setItemValue = function (nodeId, data, callback) {
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
            console.log(nodeId + " write ok");
            callback();
        } else {
            callback(err);
        }
    });
};
GcObjectAdapter.prototype.monitor_a_variable_node_value = function (nodeId, callback) {
    var count = 0;
    var me = this;
    var monitoredItem = the_subscription.monitor(
        {
            nodeId: nodeId,
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
        //console.log("monitoredItem initialized");

    });
    monitoredItem.on("changed", function (dataValue) {
        //log.debug(monitoredItem.itemToMonitor.nodeId.toString() + " value has changed to " + dataValue.value.value);
        // log('D','dataValue.dataType: ' + dataValue.value.dataType);
        // for(var p in dataValue.value){
        //     log('D','p of dataValue: ' + p);
        // }
        //console.log('Count: ' + count);
        callback(nodeId, dataValue, me);
    });
    monitoredItem.on("err", function (err_message) {
        console.log(monitoredItem.itemToMonitor.nodeId.toString(), " ERROR".red, err_message);
        callback(nodeId, null, err_message);
    });
};

GcObjectAdapter.prototype.MonitorAllGcObjects = function (callback) {
    var prefix = 'ns=1;s=PLC1';
    var lines = [];
    var nodeId = '';
    var infos = [];
    var pathInfo = '';
    var type = '';
    var segments = [];
    var me = this;
    var PLCPath = path.join(__dirname, '../../../OPCUAServer/PLC.csv');
    log.debug('Starting to monitor all gcObjects. ');
    fs.readFile(PLCPath, 'utf8', function (err, data) {
        if (err) {
            log.error( err);
        }
        else {
            lines = data.split('\n');
            nodeId = 'ns=1;s=PLC1';
            //remove header
            lines.splice(0, 1);
            log.debug('PLC.csv , lines length: ' + lines.length);
            lines.forEach(function (line) {

                infos = [];
                //console.log('line: ' + line);

                if (line) {
                    //first info is path; second info is type
                    infos = line.split(',');
                }

                if (infos.length >= 2) {

                    pathInfo = infos[0];
                    type = infos[2];
                    //remove double quotes
                    pathInfo = pathInfo.substring(1, pathInfo.length - 1);
                    segments = pathInfo.split('.');
                    // log('D','pathInfo: ' + pathInfo);
                    if (segments[0] === 'Element') {
                        if (segments[3] === 'States') {
                            me.monitor_a_variable_node_value(prefix + '.' + pathInfo, me.monitor_gcObject_callback);
                        }


                    } else if (segments[0] === 'Unit') {


                    } else if (segments[0] === 'Section') {
                        if (segments[2] === 'States') {
                            //log.debug('monitor section: ' + prefix + '.' + pathInfo);
                            me.monitor_a_variable_node_value(prefix + '.' + pathInfo, me.monitor_sectionState_callback);
                        }

                    } else if (segments[0] === 'Line') {
                        if (segments[2] === 'States') {
                            me.monitor_a_variable_node_value(prefix + '.' + pathInfo, me.monitor_lineState_callback);
                        }
                    }


                }
            });
        }

    });
};

GcObjectAdapter.prototype.monitor_gcObject_callback = function (monitored_node, dataValueOfMonitor, me) {
    var nodeData = {
        monitored_nodeId: monitored_node,
        dataValue: dataValueOfMonitor
    };
    if (dataValueOfMonitor.value.dataType.key === 'Boolean') {
        if (dataValueOfMonitor.value.value === true) {
            if (me.socket) {
                me.socket.emit('AllGcObjectsStateChanged', nodeData);
            }
        }
    }else{

    }

    // console.log('this.io: ' + this.io);


};
GcObjectAdapter.prototype.monitor_sectionState_callback = function (monitored_node, dataValueOfMonitor, me) {
    var nodeData = {
        monitored_nodeId: monitored_node,
        dataValue: dataValueOfMonitor.value.value
    };
    //log.debug('GcObjectAdapter: GcsSection state changed: ' + monitored_node);
    global.myEventEmitter.emit('GcsSectionStateChanged', nodeData);
    // me.emit('GcsSectionStateChanged', nodeData);
    // this.io.on('connection', function (socket) {
    //     socket.emit('SectionStateChanged', nodeData);
    // });

};
GcObjectAdapter.prototype.monitor_lineState_callback = function (monitored_node, dataValueOfMonitor, me) {
    var nodeData = {
        monitored_nodeId: monitored_node,
        dataValue: dataValueOfMonitor.value.value
    };
    me.emit('GcsLineStateChanged', nodeData);
    // this.io.on('connection', function (socket) {
    //     socket.emit('LineStateChanged', nodeData);
    // });

};
module.exports = GcObjectAdapter;