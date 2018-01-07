/**
 * Created by pi on 7/21/16.
 */
//var Job = require('../../Models/pr/Job');
var Storage = require('../models/eq/Storage');
var StorageCategory = require('../lib/stateAndCategory/storageCategory');
module.exports = function (app, gcObjectAd, i18n,io) {
    app.get('/storage/storageList', function (req, res) {
        Storage.findAll().then(function (storages) {
            console.log('storages: ' + storages);
            res.render('storage/storageList',
                {
                    storages: JSON.stringify(storages)
                });
        });

    });
    app.get('/storage/storageList/createStorage', function (req, res) {
        var storageInfo = {
            Ident: 'newStorage',
        };
        Storage.create(storageInfo).then(function (newStorage) {
            console.log('newLine: ' + JSON.stringify(newStorage));
            // console.log('newRecipe.save: ' +newRecipe.save);
            res.json(newStorage);
        });
    });
    app.post('/storage/storageList/deleteStorage', function (req, res) {
        var toDeleteStorageIdsStr = req.body.toDeleteStorageIdsStr;
        console.log('toDeleteStorageIdsStr:  ' + toDeleteStorageIdsStr);
        var toDeleteLineIds = JSON.parse(toDeleteStorageIdsStr);
        Storage.destroy({
            where: {
                id: {
                    $in: toDeleteLineIds
                }
            }
        }).then(function (message) {
            res.json(message);
        });
    });

    app.get('/storage/storageDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var storageStr='';
        var error ='';
        console.log('storage id: ' + id);
        Storage.findOne({
            where: {id: id}
        }).then(function (theStorage) {
            console.log('storage: ');
            console.dir(theStorage);
            if (theStorage) {
                storageStr = JSON.stringify(Storage);
                console.log('storage string: ' + storageStr);
            }
            else {

                error = i18n.__('storage not found');
                console.log(error);
            }
            res.render('storage/StorageDetail',
                {
                    storage: storageStr,
                    error: error

                });

        });
    });
    app.get('/storage/getStorage/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var storageStr='';
        var error ='';
        console.log('storage id: ' + id);
        Storage.findOne({
            where: {id: id}
        }).then(function (theStorage) {
            console.log('storage: ');
            console.dir(theStorage);
            if (theStorage) {
                res.json(
                    {
                        storage: theStorage.getJsonObject()
                    });
            }
            else {

                error = i18n.__('storage not found');
                console.log(error);
                res.json(
                    {
                        error: error
                    });
            }


        });
    });
    app.post('/storage/storageDetail', function (req, res) {
        // for(var p in req){
        //     console.log('property of req: '+ p);
        // }
        var storageStr = req.body.storageStr;
        console.log('storageStr: ' + storageStr);
        var storageFromClient = JSON.parse(storageStr);
        console.log('lineFromClient: ' + storageFromClient);
        Storage.findOne({
            where: {id: storageFromClient.id}
        }).then(function (theStorage) {
            theStorage.update(storageFromClient).then(function () {
                console.log("save successfully");
                res.json("save successfully");
            });
        });

    });
    app.get('/storage/getStorageList/:category', function (req, res) {
        var category = req.params.category.substring(1);
        var gateStoragesJson = [];
        Storage.findAll({
            where: {
                category: category
            }
        }).then(function (storages) {
            console.log('storages: ' + storages);
            storages.forEach(function (gateStorage) {
                gateStoragesJson.push(gateStorage.getJsonObject());
            });
            res.json(gateStoragesJson);
        });

    });

}