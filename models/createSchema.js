/**
 * Created by Operator on 8/4/2016.
 */
var Promise = require('promise');

//------------------------------------
//Module
var Filler = require('./eq/Filler');
var Discharger = require('./eq/Discharger');
var Storage = require('./eq/Storage');
var Company = require('./eq/Company');

var Scale = require('./eq/Scale');
var Mixer = require('./eq/Mixer');
var Packer = require('./eq/Packer');
var Section = require('./eq/Section');
var Line = require('./eq/Line');
var GcObject = require('./eq/GcObject');
var Warehouse = require('./eq/Warehouse');

var Product = require('./pr/Product');
var IngredientComponent = require('./pr/IngredientComponent');
var JobParameter = require('./pr/JobParameter');
var Recipe = require('./pr/Recipe');
var Job = require('./pr/Job');
var JobLog = require('./pr/JobLog');
var LogisticUnit = require('./pr/LogisticUnit');
var Receipt = require('./pr/Receipt');
var Layer = require('./pr/Layer');
var GroupUser = require('./um/GroupUser');
var UserGroup = require('./um/UserGroup');
var User = require('./um/User');
var AccessRight = require('./um/AccessRight');
var LotLog = require('./pr/LotLog');
var LayerLog = require('./pr/LayerLog');
var TraceLog = require('./pr/TraceLog');
var ProcessOrder = require('./pr/ProcessOrder');
var OrderItem = require('./pr/OrderItem');
var Assembly = require('./pr/Assembly');
var AssemblyItem = require('./pr/AssemblyItem');
var JobProcessOrderData = require('./pr/JobProcessOrderData');

UserGroup.sync().then(function () {

    User.sync().then(function () {
        GroupUser.sync();

    });
    AccessRight.sync().then(function () {

    });
});

Company.sync().then(function () {

});

var promises = [];
Product.sync().then(function () {


    Storage.sync().then(function () {
        Filler.sync();


    });
    var promise1 = new Promise(function (resolve, reject) {
        LogisticUnit.sync().then(function () {
            resolve();
        });
    });
    promises.push(promise1);

    Receipt.sync();
});


Line.sync().then(function () {
    Job.sync().then(function () {
        Recipe.sync().then(function () {
            IngredientComponent.sync();
            JobParameter.sync();
            JobProcessOrderData.sync();
        });
        ProcessOrder.sync().then(function () {
            OrderItem.sync();
        });
        var promise2 = new Promise(function (resolve, reject) {
            Assembly.sync().then(function () {
                AssemblyItem.sync();
                resolve();
            });
        });
        promises.push(promise2);

    });
    Section.sync().then(function () {
        Scale.sync().then(function () {
            Discharger.sync();
        });
        Mixer.sync();
        Packer.sync();
    });

});

Promise.all(promises).then(function (res) {
    Layer.sync();
}, function (err) {
    
});

Warehouse.sync();
JobLog.sync();
LotLog.sync();
LayerLog.sync();
TraceLog.sync();
GcObject.sync();