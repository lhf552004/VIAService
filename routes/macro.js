/**
 * Created by pi on 7/21/16.
 */


var JobState = require('../lib/stateAndCategory/jobState');
var getTranslateOptions = require('../lib/tools/getTranslateOptions');
var Job = require('../models/pr/Job');
var Assembly = require('../models/pr/Assembly');
var AssemblyItem = require('../models/pr/AssemblyItem');
var Layer = require('../models/pr/Layer');
var LogisticUnit = require('../models/pr/LogisticUnit');
var utils = require('../lib/utils');
var log = require('../lib/log');
var AssemblyState = require('../lib/stateAndCategory/assemblyState');
var labelPrintManager = require('../lib/labelPrintManager');

module.exports = function (app, i18n) {
    app.get('/station/macro/macroJobList', function (req, res) {
        Assembly.findAll({
            where: {
                location: 'WH',
                state: {$in: [1, 2]}
            }
        }).then(function (assemblys) {
            console.log('macro Jobs: ' + assemblys);
            LogisticUnit.findAll({where: {location: 'WH'}}).then(function (stocks) {
                res.render('station/macro/macroJobList', {
                    macroJobs: assemblys,
                    stocks: stocks
                });
            });
        });

    });
    app.get('/station/macro/macroJobDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        console.log('assembly id: ' + id);
        Assembly.findOne({
            where: {
                id: id
            }
        }).then(function (theAssembly) {
            if (theAssembly) {
                theAssembly.getAssemblyItems().then(function (assemblyItems) {
                    var toAssemblyItems = [];
                    var assemblyedItems = [];
                    assemblyItems.forEach(function (item) {
                        if (item.isFinished) {
                            assemblyedItems.push(item);
                        }
                        else {
                            toAssemblyItems.push(item);
                        }
                    });
                    res.render('station/macro/macroJobDetail', {
                        assembly: theAssembly,
                        location: theAssembly.location,
                        toAssemblyItems: toAssemblyItems,
                        assemblyedItems: assemblyedItems
                    });


                });
            }
            else {
                res.json({error: i18n.__('not found assembly: %d', id)});
            }


        });

    });
    app.get('/station/macro/scanBarcode/:id/:barcode', function (req, res) {
        var id = req.params.id.substring(1);
        var barcode = req.params.barcode.substring(1);
        var itemInfo = {};
        Layer.findOne({where: {sscc: barcode}}).then(function (theLayer) {
            if (theLayer) {
                LogisticUnit.findOne({where: {id: theLayer.LogisticUnitId}}).then(function (theLogisticUnit) {
                    if (theLogisticUnit) {
                        if (theLogisticUnit.location == 'WH') {
                            itemInfo.actualWeight = theLayer.actualWeight;
                            itemInfo.isFinished = true;
                            AssemblyItem.findOne({where: {id: id}}).then(function (theItem) {
                                if (theItem) {
                                    theItem.update(itemInfo).then(function (updatedItem) {

                                        Assembly.findOne({where: {id: theItem.AssemblyId}}).then(function (theAssembly) {
                                            if (theAssembly) {
                                                if(!theAssembly.actualWeight){
                                                    theAssembly.actualWeight = itemInfo.actualWeight;
                                                }else {
                                                    theAssembly.actualWeight += itemInfo.actualWeight;
                                                }
                                                theAssembly.save();
                                                theAssembly.getAssemblyItems().then(function (items) {
                                                    var isReady = true;
                                                    items.forEach(function (item) {
                                                        if (!item.isFinished || item.isFinished === false) {
                                                            isReady = false;
                                                        }
                                                    });
                                                    if (isReady === true) {
                                                        theAssembly.state = AssemblyState.Ready;
                                                        theAssembly.save();
                                                    } else if (theAssembly.state === AssemblyState.Created) {
                                                        theAssembly.state = AssemblyState.Working;
                                                        theAssembly.save();
                                                    }
                                                    res.json({
                                                        info: i18n.__('layer has been added'),
                                                        update: {actualWeight: theItem.actualWeight},
                                                        isReady: isReady
                                                    });

                                                })
                                            } else {
                                                res.json({error: i18n.__('Assembly not found.')});
                                            }
                                        })

                                    });
                                } else {
                                    res.json({error: i18n.__('no item found.')});
                                }
                            });
                        }
                        else {
                            res.json({error: i18n.__('logisticUnit location missing.')});
                        }
                    } else {
                        res.json({error: i18n.__('logisticUnit lost.')});
                    }
                });
            } else {
                res.json({error: i18n.__('Invalide barcode.')});
            }

        });
    });


    app.get('/macro/printAssembly/:id', function (req, res) {
        var id = req.params.id.substring(1);

        Assembly.findOne({
            where: {id: id}
        }).then(function (theAssembly) {

            labelPrintManager(theAssembly.location, {
                count: 1,
                parameter: {
                    jobIdent: theAssembly.jobIdent,
                    barcode: theAssembly.sscc,
                    targetWeight: theAssembly.targetWeight,
                    actualWeight: theAssembly.actualWeight,
                    state: i18n.__(utils.getDisplayState(AssemblyState, theAssembly.state)),
                    source: theAssembly.source,
                    target: theAssembly.target
                }
            });
            res.json({
                update: {state:80},
                info: i18n.__('confirm successfully.')
            });

        });

    });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {

        console.log('is Authenticated!!!');
        return next();
    }


    // if they aren't redirect them to the home page
    res.redirect('/login');
}