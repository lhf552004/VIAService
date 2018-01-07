/**
 * Created by pi on 7/21/16.
 */
//var Job = require('../../Models/pr/Job');
var Section = require('../models/eq/Section');
var GcsState = require('../lib/stateAndCategory/gcsState');
var SectionCategory = require('../lib/stateAndCategory/sectionCategory');
var utils = require('../lib/utils');
module.exports = function (app, gcObjectAd, i18n, io) {
    app.get('/section/sectionList', function (req, res) {
        Section.findAll().then(function (sections) {
            console.log('sections: ' + sections);
            res.render('section/sectionList',
                {
                    sections: sections
                });
        });

    });
    app.post('/section/sectionList/createSection', function (req, res) {

        var sectionInfo = req.body.sectionInfo;
        if (sectionInfo.ident) {
            Section.findOne({
                where: {ident: sectionInfo.ident}
            }).then(function (existedSection) {
                if (existedSection) {
                    res.json({error: i18n.__('the ident already existed.')});
                } else {
                    Section.create(sectionInfo).then(function (newSection) {
                        console.log('newSection: ' + JSON.stringify(newSection));
                        // console.log('newRecipe.save: ' +newRecipe.save);
                        var newSectionJson = newSection.getJsonObject();
                        //TODO: section state
                        newSectionJson.displayState = '';
                        res.json({newSection: newSectionJson});
                    });
                }
            })
        }


    });
    app.post('/section/sectionList/deleteSection', function (req, res) {
        var toDeleteSectionIdsStr = req.body.toDeleteSectionIdsStr;
        console.log('toDeleteSectionIdsStr:  ' + toDeleteSectionIdsStr);
        var toDeleteSectionIds = JSON.parse(toDeleteSectionIdsStr);
        Section.destroy({
            where: {
                id: {
                    $in: toDeleteSectionIds
                }
            }
        }).then(function (num) {
            res.json({info: i18n.__('have deleted  %d section', num)});
        });
    });

    app.get('/section/sectionDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var error = '';
        console.log('section id: ' + id);
        Section.findOne({
            where: {id: id}
        }).then(function (theSection) {
            console.log('theSection: ');
            console.dir(theSection);
            if (theSection) {
                var section =theSection.getJsonObject();
                if(section.state){
                    section.displayState = i18n.__(utils.getDisplayState(GcsState, section.state));
                }else{
                    section.displayState= '';
                }
                if(section.previousState){
                    section.displayPreviousState = i18n.__(utils.getDisplayState(GcsState, section.previousState));
                }else{
                    section.displayPreviousState= '';
                }
                if(section.category){
                    section.displayCategory = i18n.__(utils.getDisplayState(SectionCategory, section.category));
                }else{
                    section.displayCategory= '';
                }
                res.render('section/sectionDetail',
                    {
                        section: section

                    });
            }
            else {

                error = i18n.__('storage not found');
                console.log(error);
                res.render('section/sectionDetail',
                    {
                        error: error

                    });
            }


        });
    });
    app.get('/section/getSectionList/:category', function (req, res) {
        var category = req.params.category.substring(1);
        Section.findAll({where: {category: category}}).then(function (sections) {
            console.log('sections: ' + sections);
            res.json(
                {
                    sections: sections
                });
        });
    });

    app.get('/section/getSection/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var storageStr = '';
        var error = '';
        console.log('storage id: ' + id);
        Section.findOne({
            where: {id: id}
        }).then(function (theSection) {
            console.log('section: ');
            console.dir(theSection);
            if (theSection) {
                res.json(
                    {
                        section: theSection.getJsonObject()

                    });

            } else {
                res.json(
                    {
                        error: i18n.__('Section: %s is not found', id)

                    });
            }

        });
    });
    app.get('/section/getSectionByIdent/:ident', function (req, res) {
        var ident = req.params.ident.substring(1);
        var storageStr = '';
        var error = '';
        console.log('section ident: ' + ident);
        Section.findOne({
            where: {ident: ident}
        }).then(function (theSection) {
            console.log('section: ');
            console.dir(theSection);
            if (theSection) {
                res.json(
                    {
                        section: theSection.getJsonObject()

                    });

            } else {
                res.json(
                    {
                        error: i18n.__('Section: %s is not found', ident)

                    });
            }

        });
    });
    app.post('/section/sectionDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        // for(var p in req){
        //     console.log('property of req: '+ p);
        // }
        var sectionInfo = req.body.sectionInfo;

        console.log('sectionInfo: ' + sectionInfo);
        Section.findOne({
            where: {id: id}
        }).then(function (theSection) {
            if(theSection){
                theSection.update(sectionInfo).then(function () {
                    console.log("save successfully");
                    res.json({info: i18n.__("save successfully")});
                });
            }
            else {
                res.json({error: i18n.__("section not found")});
            }
        });

    });

    app.get('/section/sectionDetail/reset/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var error = '';
        console.log('section id: ' + id);
        Section.findOne({
            where: {id: id}
        }).then(function (theSection) {
            console.log('theSection: ');
            console.dir(theSection);
            if (theSection) {
                theSection.state = GcsState.Passive;
                theSection.previousState = GcsState.Passive;
                theSection.jobIdent='';
                theSection.save().then(function (savedSection) {
                    res.json({
                        info: i18n.__('reset OK'),
                        update: {}
                    });
                });
            }
            else {
                res.json({error:i18n.__('section not found')});
            }


        });
    });



}