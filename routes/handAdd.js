/**
 * Created by pi on 7/21/16.
 */
var ProcessOrder = require('../models/pr/ProcessOrder');
var Product = require('../models/pr/Product');
var Company = require('../models/eq/Company');
var Mixer = require('../models/eq/Mixer');
var OrderItem = require('../models/pr/OrderItem');
var JobState = require('../lib/stateAndCategory/jobState');
var getTranslateOptions = require('../lib/tools/getTranslateOptions');
var Job = require('../models/pr/Job');
var Assembly = require('../models/pr/Assembly');
var utils = require('../lib/utils');
var log = require('../lib/log');
var JobProcessOrderData = require('../models/pr/JobProcessOrderData');

module.exports = function (app, i18n) {
    app.get('/station/handAdd/handAddJobDetail/:mixerIdent', function (req, res) {
        var mixerIdent = req.params.mixerIdent.substring(1);
        console.log('mixerIdent: ' + mixerIdent);
        Job.findOne({
            where: {
                mixerIdent: mixerIdent,
                state: JobState.HandAdd
            }
        }).then(function (theJob) {
            console.log(theJob);
            if(theJob){
                Assembly.findAll({
                    where: {
                        jobIdent: theJob.ident,
                        state: {$in: [3, 5]}
                    }
                }).then(function (assemblies) {
                    res.render('station/handAdd/handAddJobDetail', {assemblies: assemblies});
                }) ;
            }else{
                res.render('station/handAdd/handAddJobDetail');
            }
            // findAsseblies(theJob, length, 0).then(function (pRes) {
            //     res.render('station/handAdd/handAddJobDetail', pRes);
            // }, function (err) {
            //     log(err);
            //     res.render('station/handAdd/handAddJobDetail', err);
            // });
        });
        // JobProcessOrderData.findAll({where: {mixerIdent: mixerIdent}}).then(function (jobProcessOrderDatas) {
        //     var length = jobProcessOrderDatas.length;
        //     for (var i = 0; i < length; i++) {
        //         var curJobProcessOrderData = jobProcessOrderDatas[i];
        //         if (curJobProcessOrderData) {
        //             Job.findOne({where: {id: curJobProcessOrderData.JobId}}).then(function (theJob) {
        //                 if (theJob && theJob.state === JobState.HandAdd) {
        //                     Assembly.findAll({jobIdent: theJob.ident}).then(function (assemblies) {
        //                         console.log('assemblies: ' + assemblies);
        //                         res.render('station/handAdd/handAddJobDetail', {
        //                             assemblies: assemblies
        //                         });
        //                     });
        //                 } else {
        //                     res.json({errors: i18n.__('job is not found or job state is not handAdd')});
        //                 }
        //             })
        //         }
        //     }
        // });

    });
    app.get('/station/handAdd/getAssemblies/:mixerIdent', function (req, res) {
        var mixerIdent = req.params.mixerIdent.substring(1);
        Job.findOne({
            where: {
                mixerIdent: mixerIdent,
                state: JobState.HandAdd
            }
        }).then(function (theJob) {
            var length = theJob.length;
            console.log(theJob);
            if(theJob){
                Assembly.findAll({
                    where: {
                        jobIdent: theJob.ident,
                        state: {$in: [3, 5]}
                    }
                }).then(function (assemblies) {
                    res.json({assemblies: assemblies});
                }) ;
            }else{
                res.json({error:i18n.__('no job found')});
            }
        });

    });

};
function findAsseblies(jobs, length, index) {
    var curJob = jobs[index];
    return new Promise(function (resolve, reject) {
        if (length <= 0) {
            reject({error: i18n.__('no data found')});
        } else {
            Assembly.findAll({
                where: {
                    jobIdent: theJob.ident,
                    state: {$in: [3, 5]}
                }
            }).then(function (assemblies) {
                resolve({assemblies: assemblies});
            })
            Job.findOne({where: {id: curJob.id}}).then(function (theJob) {
                if (theJob && theJob.state === JobState.HandAdd) {

                } else {
                    if (index < length) {
                        index++;
                        findAsseblies(jobs, length, index).then(function (res) {
                            resolve(res);
                        }, function (err) {
                            reject(err);
                        })
                    } else {
                        reject({error: i18n.__('no matched job found')});
                    }
                }
            })
        }

    })

}

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {

        console.log('is Authenticated!!!');
        return next();
    }


    // if they aren't redirect them to the home page
    res.redirect('/login');
}