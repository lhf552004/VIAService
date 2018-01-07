/**
 * Created by pi on 8/23/16.
 */
var modelBase = require('../ModelBase');
var GcObjectParameter = require('./../../lib/GcObjectParameter');
var util = require('util');
var GcObject = modelBase.define('GcObject', {
    ident: modelBase.Sequelize.STRING,
    nodeId: modelBase.Sequelize.STRING,
    category: modelBase.Sequelize.STRING
});
var log = require('../../lib/log');
GcObject.Instance.prototype.getGcObjectParameter = function () {

    var ElemGcObjectParameter = null;
    ElemGcObjectParameter = GcObjectParameter[this.category];
    // switch (this.category){
    //     case 'SimpleMotor':
    //         ElemGcObjectParameter = GcObjectParameter.SimpleMotor;
    //         break;
    //     case 'FilterControl':
    //         ElemGcObjectParameter = GcObjectParameter.FilterControl;
    //         break;
    //     case 'HighLevel':
    //         ElemGcObjectParameter = GcObjectParameter.HighLevel;
    //         break;
    //     case 'BeltMonitor':
    //         ElemGcObjectParameter = GcObjectParameter.BeltMonitor;
    //         break;
    //     case 'SpeedMonitor':
    //         ElemGcObjectParameter = GcObjectParameter.SpeedMonitor;
    //         break;
    //     case 'ValveOpenClose':
    //         ElemGcObjectParameter = GcObjectParameter.ValveOpenClose;
    //         break;
    // }
    if (ElemGcObjectParameter) {
        console.log('created object.\n');
        return new ElemGcObjectParameter();
    }
    else {
        return null;
    }

};
GcObject.Instance.prototype.getJsonObject = function (i18n) {

    var objectStr = JSON.stringify(this);
    return JSON.parse(objectStr);
};

GcObject.Instance.prototype.getClientEndObject = function (i18n) {

    var gcObjectparameter = this.getGcObjectParameter();
    // for(var pro in gcObjectparameter){
    //     console.log('gcObjectparameter property: ' + pro);
    // }
    // console.log('gcObjectparameter: ');
    // console.dir(gcObjectparameter);
    var jsonObject = this.getJsonObject();
    jsonObject.gcObjectParameter = gcObjectparameter;

    return jsonObject;
};
// function  inherit(sub, parent) {
//     for(var p in parent){
//         sub[p] = parent[p];
//         log('D',p + sub[p]);
//     }
//     log('D',sub);
//     return sub;
// }
module.exports = GcObject;