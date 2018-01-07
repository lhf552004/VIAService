/**
 * Created by pi on 8/26/16.
 */
var GcObjectParameter = require('./../lib/GcObjectParameter');
var Promise = require('promise');
var modelBase = require('./ModelBase');
var utils = require('../lib/utils');
function BusinessBase() {

}

BusinessBase.prototype = {
    getJsonObject: function () {
        var jobStr = JSON.stringify(this);
        return JSON.parse(jobStr);
    },
    getTranslatedObject: function (stateEnum) {
        var JSONObject = this.getJsonObject();
        if(JSONObject.state){
            if(stateEnum){
                JSONObject.displayState = global.i18n.__(utils.getDisplayState(stateEnum, JSONObject.state));
            }else {
                JSONObject.displayState = JSONObject.state;
            }

        }

        return JSONObject;
    },
    getGcObjectParameter: function () {

        var ElemGcObjectParameter = null;
        ElemGcObjectParameter = GcObjectParameter[this.category];
        // switch (this.category) {
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

    },
    getClientEndObject: function () {

        var gcObjectparameter = this.getGcObjectParameter();
        var jsonObject = this.getJsonObject();
        jsonObject.gcObjectParameter = gcObjectparameter;

        return jsonObject;
    },
    getMaxId: function (tableName) {
        var me = this;
        console.dir(me.Model);
        return new Promise(function (resolve, reject) {
            modelBase.query('select max(id) from ' + tableName, {type: modelBase.QueryTypes.SELECT}).then(function (data) {
                console.log('max ' + data);
                console.dir(data);
                var max = data[0]['max(id)'];
                if (!max) {
                    max = 0;
                }
                max++;
                resolve(utils.pad(max, 6));
            });

        });

    }
};
module.exports = BusinessBase;