/**
 * Created by pi on 7/21/16.
 */
//var Job = require('../../Models/pr/Job');
var Line = require('../models/eq/Line');
var GcsState = require('../lib/stateAndCategory/gcsState');
module.exports = function (app, i18n) {
    app.get('/line/lineList', function (req, res) {
        Line.findAll({

        }).then(function (lines) {
            console.log('lines: '+ lines);
            res.render('line/lineList',
                {
                    lines: JSON.stringify(lines)
                });
        });

    });
    app.get('/line/getLineList', function (req, res) {
        Line.findAll({

        }).then(function (lines) {
            console.log('lines: '+ lines);

            res.json(
                {
                    lines: JSON.stringify(lines)
                });
        });

    });
    app.get('/line/lineList/createLine',isLoggedIn, function (req, res) {
        var lineInfo = {
            Ident: 'newLine',
            State: GcsState.Passive
        };
        Line.create(lineInfo).then(function (newLine) {
            console.log('newLine: ' + JSON.stringify(newLine));
            // console.log('newRecipe.save: ' +newRecipe.save);
            res.json(newLine);
        });
    });
    app.post('/line/lineList/deleteLine',isLoggedIn, function (req, res) {
        var toDeleteLineIdsStr = req.body.toDeleteLineIdsStr;
        console.log('toDeleteLineIdsStr:  ' + toDeleteLineIdsStr);
        var toDeleteLineIds = JSON.parse(toDeleteLineIdsStr);
        Line.destroy({
            where:{
                id: {
                    $in: toDeleteLineIds
                }
            }
        }).then(function (message) {
            res.json(message);
        });
    });

    app.get('/line/lineDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        console.log('Line id: ' + id);
        Line.findOne({
            where: {id: id}
        }).then(function (theLine) {
            var lineStr = JSON.stringify(theLine);
            console.log('line string: ' + lineStr);
            res.render('line/lineDetail',
                {
                    line: lineStr

                });
        });
    });
    app.post('/line/lineDetail',isLoggedIn, function (req, res) {
        // for(var p in req){
        //     console.log('property of req: '+ p);
        // }
        var lineStr = req.body.lineStr;
        console.log('lineStr: ' + lineStr);
        var lineFromClient = JSON.parse(lineStr);
        console.log('lineFromClient: ' + lineFromClient);
        Line.findOne({
            where: {id: lineFromClient.id}
        }).then(function (theLine) {
            theLine.update(lineFromClient).then(function () {
                console.log("save successfully");
                res.json("save successfully");
            });
        });

    });
    app.get('/line/getLine/:ident', function (req, res) {
        var ident = req.params.ident.substring(1);
        console.log('Line ident: ' + ident);
        Line.findOne({
            where: {ident: ident}
        }).then(function (theLine) {
            console.log('line: ');
            console.dir(theLine.getJsonObject());
            res.json(
                {
                    line: theLine.getJsonObject()

                });
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