/**
 * Created by pi on 7/21/16.
 */
//var Job = require('../../Models/pr/Job');
var Mixer = require('../models/eq/Mixer');
var Line = require('../models/eq/Line');
var Section = require('../models/eq/Section');
var GcsState = require('../lib/stateAndCategory/gcsState');
module.exports = function (app, i18n) {
    //TODO: eventlog routes
    app.get('/mixer/mixerList', function (req, res) {
        Mixer.findAll({

        }).then(function (mixers) {
            console.log('mixers: '+ mixers);
            res.render('mixer/mixerList',
                {
                    mixers: JSON.stringify(mixers)
                });
        });

    });
    app.get('/mixer/getmixerList', function (req, res) {
        Mixer.findAll({

        }).then(function (mixers) {
            console.log('mixers: '+ mixers);

            res.json(
                {
                    mixers: JSON.stringify(mixers)
                });
        });

    });
    app.get('/mixer/mixerList/createMixer',isLoggedIn, function (req, res) {
        var mixerInfo = {
            Ident: 'newMixer',
            State: GcsState.Passive
        };
        Mixer.create(mixerInfo).then(function (newMixer) {
            console.log('newMixer: ' + JSON.stringify(newMixer));
            // console.log('newRecipe.save: ' +newRecipe.save);
            res.json(newMixer);
        });
    });
    app.post('/mixer/mixerList/deleteMixer',isLoggedIn, function (req, res) {
        var toDeleteMixerIdsStr = req.body.toDeleteMixerIdsStr;
        console.log('toDeleteMixerIdsStr:  ' + toDeleteMixerIdsStr);
        var toDeleteMixerIds = JSON.parse(toDeleteMixerIdsStr);
        Mixer.destroy({
            where:{
                id: {
                    $in: toDeleteMixerIds
                }
            }
        }).then(function (message) {
            res.json(message);
        });
    });

    app.get('/mixer/mixerDetail/:id',isLoggedIn, function (req, res) {
        var id = req.params.id.substring(1);
        console.log('mixer id: ' + id);
        Mixer.findOne({
            where: {id: id}
        }).then(function (theMixer) {
            var mixerStr = JSON.stringify(theMixer);
            console.log('mixer string: ' + mixerStr);
            res.render('mixer/mixerDetail',
                {
                    mixer: mixerStr

                });
        });
    });
    app.post('/mixer/mixerDetail',isLoggedIn, function (req, res) {
        // for(var p in req){
        //     console.log('property of req: '+ p);
        // }
        var mixerStr = req.body.mixerStr;
        console.log('mixerStr: ' + mixerStr);
        var mixerFromClient = JSON.parse(mixerStr);
        console.log('mixerFromClient: ' + mixerFromClient);
        Mixer.findOne({
            where: {id: mixerFromClient.id}
        }).then(function (theMixer) {
            theMixer.update(mixerFromClient).then(function () {
                console.log("save successfully");
                res.json("save successfully");
            });
        });

    });
    app.get('/mixer/getmixer/:ident', function (req, res) {
        var ident = req.params.ident.substring(1);
        console.log('Mixer ident: ' + ident);
        Mixer.findOne({
            where: {ident: ident}
        }).then(function (theMixer) {
            console.log('Mixer: ');
            console.dir(theMixer.getJsonObject());
            res.json(
                {
                    mixer: theMixer.getJsonObject()

                });
        });
    });
    app.get('/mixer/getLine/:ident', function (req, res) {
        var ident = req.params.ident.substring(1);
        console.log('Mixer ident: ' + ident);
        Mixer.findOne({
            where: {ident: ident}
        }).then(function (theMixer) {
            console.log('Mixer: ');
            console.dir(theMixer.getJsonObject());
            if(theMixer){
                Section.findOne({where:{id: theMixer.SectionId}}).then(function (theSection) {
                    if(theSection){
                        Line.findOne({where:{id: theSection.LineId}}).then(function (theLine) {
                            if(theLine){
                                res.json(
                                    {
                                        line: theLine.getJsonObject()

                                    });
                            }else{
                                res.json(
                                    {
                                        error: i18n.__('theLine is not found.')

                                    });
                            }

                        });
                    }else {
                        res.json(
                            {
                                error: i18n.__('theSection is not found.')

                            });
                    }
                });
            }else {
                res.json(
                    {
                        error: i18n.__('theMixer is not found.')

                    });
            }

        });
    });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){

        console.log('is Authenticated!!!');
        return next();
    }


    // if they aren't redirect them to the home page
    res.redirect('/login');
}