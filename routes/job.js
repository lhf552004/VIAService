/**
 * Created by pi on 8/15/16.
 */

var Job = require('../models/pr/Job');
var Layer = require('../models/pr/Layer');
var LogisticUnit = require('../models/pr/LogisticUnit');
var Recipe = require('../models/pr/Recipe');
var Line = require('../models/eq/Line');
var IngredientComponent = require('../models/pr/IngredientComponent');
var Promise = require('promise');
var getDisplayState = require('../lib/tools/getDisplayState');
var WarehousePackingType = require('../lib/stateAndCategory/warehousePackingType');
var util = require('util');
var log = require('../lib/log');
var events = require('events');
var eventEmitter = new events.EventEmitter();
// Job.belongsTo(Line,{as: 'line'});
// var ControllerAdapter = require('../adapters/ControllerAdapter');
var JobState = require('../lib/stateAndCategory/jobState');
// var Recipe = require('../../Models/pr/Recipe');
module.exports = function (app, controllerManager, i18n, io) {
    app.get('/job/jobList/:lineIdent', function (req, res) {
        var lineIdent = req.params.lineIdent.substring(1);
        console.log('lineIdent: ' + lineIdent);

        console.log('isAuthenticated: ' + req.isAuthenticated());
        // var jobs =[];
        Job.findAll({
            where: {
                LineIdent: lineIdent,
                state: {$notIn: [JobState.Done]}
            }
        }).then(function (jobs) {

            console.log('jobs: ' + jobs);
            res.render('job/jobList',
                {
                    jobs: JSON.stringify(Job.getTranslatedJobs(jobs, i18n)),
                    lineIdent: lineIdent
                });
        });

    });
    app.get('/job/jobList/createJob/:lineIdent', function (req, res) {
        var lineIdent = req.params.lineIdent.substring(1);
        var errors = [];
        var error = '';
        console.log(lineIdent);
        Line.findOne({
            where: {Ident: lineIdent}
        }).then(function (theLine) {
            if (!theLine) {
                error = i18n.__('the line is not defined');
                res.json({error: error});
            } else {
                Job.getMaxId().then(function (data) {
                    console.log('get max id: ' + data);
                    var jobInfo = {
                        ident: lineIdent + ':' + data,
                        name: lineIdent,
                        lineIdent: lineIdent,
                        visible: true,
                        isTemplate: false,
                        locked: true,
                        targetWeight: 0.0,
                        actualWeight: 0.0,
                        state: JobState.Created,
                        LineId: theLine.id
                    };
                    Job.create(jobInfo).then(function (newJob) {
                        // for(var p in newJob){
                        //     console.log('Job property: ' + p);
                        // }
                        console.log('newJob');
                        console.dir(newJob);
                        var promises = [];
                        Recipe.findOne({
                            where: {
                                LineId: theLine.id,
                                isTemplate: true
                            }
                        }).then(function (RecipeTemplate) {
                            console.log('RecipeTemplate');
                            console.dir(RecipeTemplate);
                            if (RecipeTemplate) {
                                Recipe.create({
                                    Ident: newJob.Ident,
                                    Name: newJob.Ident,
                                    isTemplate: false,
                                    State: JobState.Created,
                                    JobId: newJob.id
                                }).then(function (newRecipe) {
                                    console.log('newRecipe');
                                    console.dir(newRecipe);
                                    RecipeTemplate.getSenders().then(function (ingredients) {
                                        ingredients.forEach(function (ingredient) {
                                            IngredientComponent.create({
                                                category: ingredient.category,
                                                targetPercentage: ingredient.targetPercentage,
                                                targetWeight: ingredient.targetWeight,
                                                storageIdent: ingredient.storageIdent,
                                                ProductId: ingredient.ProductId,
                                                RecipeId: newRecipe.id,
                                                productIdent: ingredient.productIdent,
                                                isActive: ingredient.isActive
                                            }).then(function (newIngredient) {
                                                console.log('newIngredient');
                                                console.dir(newIngredient);
                                                if (newIngredient) {
                                                    console.log('created new ingredient');

                                                }
                                                else {
                                                    console.log('ingredient is empty');
                                                }
                                            });
                                        });
                                    });
                                });
                            } else {
                                error = i18n.__('the recipe template is not defined');
                            }

                            // //console.log('Job addLine: ' + newJob.addLine);
                            // console.log('Job setLine: ' + newJob.setLine);
                            // console.log('Job getLine: ' + newJob.getLine);
                            // console.log('new Job: ' + JSON.stringify(newJob));
                            // var newJobStr = newJob.getTranslatedJobStr(i18n);
                            // console.log('converted new Job: ' + newJobStr);
                            // res.json({newJobStr: newJobStr});
                        });
                        var jobJson = newJob.getTranslatedJob(i18n);
                        res.json({job: jobJson});
                    });
                });

            }

        });

    });
    app.post('/job/jobList/deleteJob', function (req, res) {
        var toDeleteJobIdsStr = req.body.toDeleteJobIdsStr;
        console.log('toDeleteJobIdsStr:  ' + toDeleteJobIdsStr);
        var toDeleteJobIds = JSON.parse(toDeleteJobIdsStr);
        Job.destroy({
            where: {
                id: {
                    $in: toDeleteJobIds
                }
            }
        }).then(function (message) {
            log.debug('message of delete');
            log.debug(message);
            res.json(message);
        });
    });
    // app.get('/job/jobList/:lineIdent', isLoggedIn, function (req, res) {
    //     var lineIdent = req.params.lineIdent.substring(1);
    //     console.log(lineIdent);
    //
    //
    //     // var jobs =[];
    //     Job.findAll({
    //         where: {
    //             LineIdent: lineIdent,
    //         }
    //     }).then(function (jobs) {
    //
    //         console.log('jobs: ' + jobs);
    //         res.render('job/jobList',
    //             {
    //                 jobs: JSON.stringify(Job.getTranslatedJobs(jobs, i18n)),
    //                 LineIdent: lineIdent
    //             });
    //     });
    //
    // });
    app.get('/job/jobDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var jobJson = {};

        Job.findOne({
            where: {id: id}
        }).then(function (theJob) {
            if (theJob) {
                jobJson = theJob.getTranslatedJob(i18n);
                theJob.getRecipe().then(function (theRecipe) {
                    if (theRecipe) {
                        jobJson.recipe = theRecipe.getJsonObject();
                        jobJson.recipe.senders = [];
                        jobJson.recipe.receivers = [];
                        theRecipe.getSenders().then(function (ingredients) {
                            ingredients.forEach(function (ingredient) {
                                if (ingredient.category === 0) {
                                    jobJson.recipe.senders.push(ingredient.getJsonObject());
                                } else {
                                    jobJson.recipe.receivers.push(ingredient.getJsonObject());
                                }
                            });
                            res.render('job/jobDetail',
                                {
                                    job: jobJson,
                                    recipe: JSON.stringify(jobJson.recipe)

                                });
                        })
                    } else {
                        res.render('job/jobDetail', {error: i18n.__('Job: %s recipe is empty.', id)});
                    }

                });
            }
            else {
                res.json({error: i18n.__('Job: %s is empty.', id)});
            }

        });

    });
    app.get('/job/jobDetail/checkJob/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var error = '';
        var controller = null;
        console.log('id: ' + id);
        Job.findOne({
            where: {id: id}
        }).then(function (theJob) {
            if (theJob) {
                console.log('theJob:' + theJob);
                theJob.getLine().then(function (theLine) {
                    console.log('TheLine:');
                    //console.dir(theLine);
                    if (theLine) {
                        console.log('TheLine controller name: ' + theLine.controllerName);
                        controller = controllerManager.getController(theLine.controllerName);
                        //log(controller._checkJob);
                        controller.checkJob(theJob).then(function (data) {
                            console.log('check job is OK:');
                            console.log(data);
                            theJob.update({
                                locked: false
                            }).then(function (updatedJob) {
                                console.log('save updated job is OK');
                                eventEmitter.emit('checkJobOk');
                            });
                            res.json({
                                update: {locked: false},
                                info: i18n.__('check job is OK:')
                            });
                        }, function (errors) {
                            console.log('check job failed');
                            console.log(errors);
                            res.json(errors);
                        });
                    }
                });


            }
            else {

                error = i18n.__('the job: %s is not found', id);
                console.log(error);
                res.json({
                    error: error
                });
            }
        });


    });
    app.get('/job/jobDetail/startJob/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var error = '';
        var controller = null;
        Job.findOne({
            where: {id: id}
        }).then(function (theJob) {
            if (theJob) {
                theJob.getLine().then(function (theLine) {
                    console.log('TheLine:');
                    console.dir(theLine);
                    if (theLine) {
                        controller = controllerManager.getController(theLine.controllerName);
                        controller.startJob(theJob).then(function (Pres) {
                            console.log("routes: startJob: callback");
                            theJob.update({
                                state: JobState.Loading
                            }).then(function (updatedJob) {
                                console.log("routes: startJob: job save successfully");
                                res.json({
                                    update: {
                                        displayState: i18n.__(getDisplayState(JobState, JobState.Loading)),
                                        state: JobState.Loading
                                    }
                                });
                            });
                        }, function (Perr) {
                            res.json(Perr);
                        });
                    } else {
                        error = i18n.__('routes: startJob: the line: %s is not found', theJob.LineId);
                        console.log(error);
                        res.json({
                            error: error
                        });
                    }
                });
            }
            else {
                error = i18n.__('routes: startJob: the job: %s is not found', id);
                console.log(error);
                res.json({
                    error: error
                });
            }
        });


    });
    app.get('/job/jobDetail/doneJob/:id', function (req, res) {
        var id = req.params.id.substring(1);
        console.log('id: ' + id);
        var error = '';
        var controller = null;
        Job.findOne({
            where: {id: id}
        }).then(function (theJob) {
            if (theJob) {
                theJob.getLine().then(function (theLine) {
                    // console.log('TheLine:');
                    // console.dir(theLine);
                    if (theLine) {
                        controller = controllerManager.getController(theLine.controllerName);
                        console.log('controller: ' + controller);
                        controller.stopJob(theJob).then(function (Pres) {
                            console.log("routes: doneJob: callback");
                            res.json({
                                info: i18n.__('The job is stopping.')
                            });

                        }, function (Perr) {
                            res.json({
                                error: Perr
                            });
                        });
                    } else {
                        error = i18n.__('the line: %s is not found', theJob.LineId);
                        console.log(error);
                        res.json({
                            error: error
                        });
                    }
                });
            }
            else {
                error = i18n.__('the job: %s is not found', id);
                console.log(error);
                res.json({
                    error: error
                });
            }
        });


    });
    app.post('/job/jobDetail/:id', function (req, res) {
        // for(var p in req){
        //     console.log('property of req: '+ p);
        // }
        var id = req.params.id.substring(1);
        var targetWeight = req.body.targetWeight;
        var locked = req.body.locked;
        var productIdent = req.body.productIdent;
        var productName = req.body.productName;
        var info = '';
        var updateInfo = {};
        if (targetWeight) {
            updateInfo.targetWeight = targetWeight;
        }
        if (locked) {
            updateInfo.locked = locked;
        }
        if (productIdent) {
            updateInfo.productIdent = productIdent;
        }
        if (productName) {
            updateInfo.productName = productName;
        }
        console.log('TargetWeight: ' + targetWeight);
        console.log('locked: ' + locked);
        Job.findOne({
            where: {id: id}
        }).then(function (theJob) {
            if (theJob) {
                theJob.update(updateInfo).then(function (theJob) {
                    info = i18n.__("save successfully");

                    res.json({info: info});
                });
            }

        });

    });
    app.get('/job/scheduleJob/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var jobJson = {};

        Job.findOne({
            where: {id: id}
        }).then(function (theJob) {
            if (theJob) {
                theJob.state = JobState.Scheduled;
                theJob.save();
                theJob.updateIngredients().then(function (pRes) {
                    console.dir(pRes);
                    var resData = {
                        update: {
                            state: JobState.Scheduled,
                            displayState: i18n.__(getDisplayState(JobState, JobState.Scheduled))
                        },
                        info: i18n.__('job has been scheduled.')
                    };
                    if (pRes) {
                        resData.update.receiver = pRes.receiver;

                    }
                    res.json(resData);
                }, function (pErr) {
                    console.dir(pErr);
                    res.json(pErr);
                });

            }
            else {
                res.json({error: i18n.__('Job: %s is empty.', id)});
            }

        });

    });
    app.get('/job/unscheduleJob/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var jobJson = {};

        Job.findOne({
            where: {id: id}
        }).then(function (theJob) {
            if (theJob) {
                theJob.state = JobState.Released;
                theJob.save();
                res.json({
                    update: {
                        state: JobState.Released,
                        displayState: i18n.__(getDisplayState(JobState, JobState.Released))
                    },
                    info: i18n.__('job has been unscheduled.')
                });
            }
            else {
                res.json({error: i18n.__('Job: %s is empty.', id)});
            }

        });

    });
    //station
    app.get('/station/job/jobList/:lineIdent', function (req, res) {
        var lineIdent = req.params.lineIdent.substring(1);
        console.log('lineIdent: ' + lineIdent);

        console.log('isAuthenticated: ' + req.isAuthenticated());
        // var jobs =[];
        Job.findAll({
            where: {
                LineIdent: lineIdent,
                locked: false,
                state: {$notIn: [JobState.Done]}
            }
        }).then(function (jobs) {

            console.log('jobs: ' + jobs);
            res.render('station/job/jobList',
                {
                    jobs: JSON.stringify(Job.getTranslatedJobs(jobs, i18n)),
                    lineIdent: lineIdent
                });
        });

    });
    app.get('/station/job/jobDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var jobJson = {};

        Job.findOne({
            where: {id: id}
        }).then(function (theJob) {
            if (theJob) {
                jobJson = theJob.getTranslatedJob(i18n);
                theJob.getRecipe().then(function (theRecipe) {
                    if (theRecipe) {
                        jobJson.recipe = theRecipe.getJsonObject();
                        jobJson.recipe.senders = [];
                        jobJson.recipe.receivers = [];
                        theRecipe.getSenders().then(function (ingredients) {
                            ingredients.forEach(function (ingredient) {
                                if (ingredient.category === 0) {
                                    jobJson.recipe.senders.push(ingredient.getJsonObject());
                                } else {
                                    jobJson.recipe.receivers.push(ingredient.getJsonObject());
                                }
                            });
                            res.render('station/job/jobDetail',
                                {
                                    job: jobJson,
                                    recipe: JSON.stringify(jobJson.recipe)

                                });
                        })
                    } else {
                        res.render('station/job/jobDetail', {error: i18n.__('Job: %s recipe is empty.', id)});
                    }

                });
            }
            else {
                res.json({error: i18n.__('Job: %s is empty.', id)});
            }

        });

    });
    app.get('/job/station/scanBarcode/:id/:barcode', function (req, res) {
        var id = req.params.id.substring(1);
        var barcode = req.params.barcode.substring(1);
        var jobJson = {};
        var segments = barcode.split('_');
        var productIdent = '';
        var lotIdent = '';
        if (segments.length && segments.length > 1) {
            productIdent = segments[0];
            lotIdent = segments[1];
            Job.findOne({
                where: {id: id}
            }).then(function (theJob) {
                if (theJob) {
                    if (productIdent === theJob.productIdent) {
                        if (segments.length === 3) {
                            console.log('barcode: ' + barcode);
                            Layer.findOne({where: {sscc: barcode}}).then(function (theLayer) {
                                if (theLayer) {

                                    if (theJob.state === JobState.Created) {
                                        theJob.start(controllerManager, i18n).then(function () {
                                            theJob.registerAssemblyToStorage(theLayer, i18n).then(function (remainWeight) {
                                                theJob.update({actualWeight: remainWeight});
                                                res.json({
                                                    update: {
                                                        displayState: getDisplayState(JobState, JobState.Loading),
                                                        state: JobState.Loading,
                                                        actualWeight: remainWeight
                                                    },
                                                    info: i18n.__('Job is loading, Please scan next barcode.')
                                                });
                                            }, function (pError1) {
                                                res.json(pError1);
                                            });
                                        }, function (pError) {
                                            res.json(pError);
                                        });
                                    } else {
                                        theJob.registerAssemblyToStorage(theLayer).then(function () {
                                            res.json({
                                                info: i18n.__('Please scan next barcode.')
                                            });
                                        }, function (pError1) {
                                            res.json(pError1);
                                        });

                                    }
                                } else {
                                    res.json({error: i18n.__('Layer is not found.')});
                                }
                            });
                        } else {
                            res.json({error: i18n.__('barcode length is invalid')});
                        }

                    } else {
                        res.json({error: i18n.__('take wrong product')});
                    }
                }
                else {
                    res.json({error: i18n.__('Job: %s is empty.', id)});
                }

            });
        } else {
            res.json({error: i18n.__('barcode is invalid')});
        }


    });

    io.on('connection', function (socket) {
        eventEmitter.on('checkJobOk', function (nodeData) {
            log.debug('Event: newJob');
            socket.emit('newJob');

        });
    })
    app.get('/job/getJobList/:lineIdent', function (req, res) {
        var lineIdent = req.params.lineIdent.substring(1);
        console.log('lineIdent: ' + lineIdent);

        console.log('isAuthenticated: ' + req.isAuthenticated());
        // var jobs =[];
        Job.findAll({
            where: {
                LineIdent: lineIdent,
                state: {$notIn: [JobState.Done]}
            }
        }).then(function (jobs) {

            console.log('jobs: ' + jobs);
            jobs.forEach(function (theJob) {
                // console.log('Job:' + theJob.ident+ ' receiver: ' + theJob.receiver);
                // if(!theJob.receiver){
                //     theJob.getReceiver();
                // }

            });
            res.json({
                jobs: JSON.stringify(Job.getTranslatedJobs(jobs, i18n)),
                lineIdent: lineIdent
            });
        });

    });
    app.get('/job/getJobDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var jobJson = {};

        Job.findOne({
            where: {id: id}
        }).then(function (theJob) {
            if (theJob) {
                jobJson = theJob.getTranslatedJob(i18n);
                theJob.getRecipe().then(function (theRecipe) {
                    if (theRecipe) {
                        jobJson.recipe = theRecipe.getJsonObject();
                        jobJson.recipe.senders = [];
                        jobJson.recipe.receivers = [];
                        theRecipe.getSenders().then(function (ingredients) {
                            ingredients.forEach(function (ingredient) {
                                if (ingredient.category === 0) {
                                    jobJson.recipe.senders.push(ingredient.getJsonObject());
                                } else {
                                    jobJson.recipe.receivers.push(ingredient.getJsonObject());
                                }
                            });
                            res.json(
                                {
                                    job: jobJson,
                                    recipe: JSON.stringify(jobJson.recipe)

                                });
                        })
                    } else {
                        res.json({error: i18n.__('Job: %s recipe is empty.', id)});
                    }

                });
            }
            else {
                res.json({error: i18n.__('Job: %s is empty.', id)});
            }

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