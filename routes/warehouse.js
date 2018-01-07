/**
 * Created by pi on 7/21/16.
 */
var LogisticUnit = require('../models/pr/LogisticUnit');
var Layer = require('../models/pr/Layer');
var Product = require('../models/pr/Product');
var Company = require('../models/eq/Company');
var utils = require('../lib/utils');
var LotState = require('../lib/stateAndCategory/lotState');
var WarehousePackingType = require('../lib/stateAndCategory/warehousePackingType');
var labelPrintManager = require('../lib/labelPrintManager');

module.exports = function (app, i18n) {
    app.get('/warehouse/logisticUnitList/:location', function (req, res) {
        var location = req.params.location.substring(1);

        LogisticUnit.findAll({
            where: {location: location}
        }).then(function (logisticUnits) {
            res.render('warehouse/logisticUnitList', {
                logisticUnits: logisticUnits,
                location: i18n.__(location)
            });
        });

    });

    app.get('/warehouse/logisticUnitDetail/:id', function (req, res) {
        var id = req.params.id.substring(1);
        var logisticUnitJson = {};
        LogisticUnit.findOne({
            where: {id: id}
        }).then(function (theLogisticUnit) {
            logisticUnitJson = theLogisticUnit.getJsonObject();
            logisticUnitJson.displayState = i18n.__(utils.getDisplayState(LotState, theLogisticUnit.state));
            logisticUnitJson.packagingTypeName = i18n.__(utils.getDisplayState(WarehousePackingType, theLogisticUnit.packagingType));
            Layer.findAll({where:{LogisticUnitId: id}}).then(function (layers) {
                res.render('warehouse/logisticUnitDetail', {
                    logisticUnit: logisticUnitJson,
                    location: theLogisticUnit.location,
                    layers: layers
                });
            });

        });

    });
    app.get('/warehouse/layers/:logisticUnitId', function (req, res) {
        var logisticUnitId = req.params.logisticUnitId.substring(1);


        Layer.findAll({where:{LogisticUnitId: logisticUnitId}}).then(function (layers) {
            res.json({layers: layers});
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