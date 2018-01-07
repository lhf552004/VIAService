/**
 * Created by pi on 8/25/16.
 */
var fs = require('fs');
var path = require('path');
var centralConfig = require('../config/centralConfig.json');
var prefix = 'log';
var prefixServer ='serverLog';
var basePath = path.join(__dirname, '../../../log');
var wstream;
var logs=[];

//fs.createWriteStream(logfile);
fs.exists(basePath, function (isExisted) {
    if (!isExisted) {
        fs.mkdir(basePath);
    }

});
var getFullFileName = function (isServer) {
    var fileName = '';
    var theTime = new Date();
    var theYear = theTime.getFullYear();
    var theMonth = theTime.getMonth() + 1;
    var theDay = theTime.getDate();
    var theHour = theTime.getHours();
    if(isServer){
        fileName = basePath + '/' + prefixServer + '-' + theYear + '-' + theMonth + '-' + theDay + '-' + theHour + '.log';
    }else {
        fileName = basePath + '/' + prefix + '-' + theYear + '-' + theMonth + '-' + theDay + '-' + theHour + '.log';
    }

    return fileName;
};
var log = function (data,isOPCUA) {


    //console.log('type: ' + typeof (data));
    if (typeof (data) === 'object') {
        data = JSON.stringify(data);
    }
    if (typeof (data) === 'function') {
        data = data.toString();
    }
    // fs.exists(fullFileName,function (isExisted) {
    //     if(isExisted){
    //         fs.open(fullFileName, 'w+', function(err, fd) {
    //             if (err) {
    //                 return console.error(err);
    //             }
    //             console.log("File opened successfully!");
    //         });
    //     }else {
    //
    //     }
    // });
    // logs.push(data);
    var fullFileName = getFullFileName();
    fs.appendFile(fullFileName, data, function (err) {
        if (err) {
            console.log('append file: ' + err);
        }
    });
    console.log(data);

};
// writeLog();
// function writeLog() {
//     setTimeout(function () {
//
//         if(logs.length>0){
//             var fullFileName = getFullFileName();
//             console.log('has logged');
//             var logsStr = logs.join('');
//             fs.appendFile(fullFileName, logsStr, function (err) {
//                 if (err) {
//                     console.log('append file: ' + err);
//                 }
//
//             });
//             logs = [];
//         }
//         writeLog();
//     },1000);
// }

module.exports = log;
module.exports.getFullFileName = getFullFileName;
function _getLogText(data, type, source) {
    var sourceText='';
    if (typeof (data) === 'object') {
        data = JSON.stringify(data);
    }
    if (typeof (data) === 'function') {
        data = data.toString();
    }
    if (!type) {
        type = 'D';
    }
    var time = new Date().toLocaleString();
    if (source) {
        sourceText = '[' + source + ']: ';
    }
    return time + ': [' + type + ']: ' + sourceText + data + '\n';
}
module.exports.debug = function (data, source) {
    if (centralConfig && centralConfig.logLevel > 0) {
        if(source === 'OPCUA'){
            log(_getLogText(data, 'D', source),true);
        }else {
            log(_getLogText(data, 'D', source),false);
        }

    }

};
module.exports.info = function (data, source) {
    if(source === 'OPCUA'){
        log(_getLogText(data, 'I', source),true);
    }else {
        log(_getLogText(data, 'I', source),false);
    }
};
module.exports.error = function (data, source) {
    if(source === 'OPCUA'){
        log(_getLogText(data, 'E', source),true);
    }else {
        log(_getLogText(data, 'E', source),false);
    }
};
module.exports.warn = function (data, source) {
    if(source === 'OPCUA'){
        log(_getLogText(data, 'W', source),true);
    }else {
        log(_getLogText(data, 'W', source),false);
    }
};
