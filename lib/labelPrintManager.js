/**
 * Created by pi on 9/6/16.
 */
var _ = require('underscore');
var Printer = require('node-printer');
//var printer = new Printer('HP-LaserJet-5200-2');
var fs = require('fs');
var config = require('../config/printerConfig.json');
var utils = require('./utils');
//var pdf = require('html-pdf');
var path = require('path');
var base = path.join(__dirname, "../");
var barcode = require('barcode');
console.log("__dirname: " + __dirname);
console.log("base: " + base);
var theOptions = {
    format: 'Letter',
    base: 'file:///' + base
};

function getLabelAndPrinter(labelName) {
    this.printerName = config[labelName].printer;
    this.label = config[labelName].label;
}
function getbarcodeValue(labelName, parameter) {
    var data ='';
    switch (labelName){
        case 'receipt':
            data = parameter.ident + '-' + parameter.lot + '-' + parameter.bagNo;
            break;
        case 'dis1':
            data = parameter.ident + '-' + parameter.lot + '-' + parameter.bagNo;
            break;
        case 'dispatch':
            data = parameter.ident + '-' + parameter.lot + '-' + parameter.bagNo;
            break;

    }
    return data;
}
function printReceiptlable(compiled, parameter, i, count, printer) {

}
function printLabel(compiled, parameter, i, count, printer,labelName) {
    parameter.bagNo = utils.pad(i, 4);
    if(!parameter.barcode ){
        parameter.barcode = getbarcodeValue(labelName, parameter);
    }
    console.log('barcode: ' + parameter.barcode );
    var html = compiled(parameter);
    //Exception: Failed to load PhantomJS module
    //Error: cannot find module 'phantomjs-prebuilt'
    // pdf.create(html, theOptions).toBuffer(function (err, buffer) {
    //     console.log('This is a buffer:', Buffer.isBuffer(buffer));
    //     // console.dir(buffer);
    //     // console.log('Type: '+ typeof (buffer));
    //     if(Buffer.isBuffer(buffer)){
    //         var jobFromBuffer = printer.printBuffer(buffer);
    //         jobFromBuffer.once('sent', function () {
    //             jobFromBuffer.on('completed', function () {
    //                 console.log('Job ' + jobFromBuffer.identifier + ' has been printed');
    //                 jobFromBuffer.removeAllListeners();
    //             });
    //         });
    //
    //     }
    //     i++;
    //     if (i <= count) {
    //         printLabel(compiled, parameter, i, count, printer,labelName);
    //     } else {
    //
    //     }
    //
    // });

    // var code39 = barcode('code39', {
    //     data: parameter.barcode,
    //     width: 400,
    //     height: 100
    // });
    // var outfile = base + 'temps/imgs/'+ labelName + '.png';
    // code39.saveImage(outfile, function (err) {
    //     if (err) throw err;
    //
    //
    // });


}
module.exports = function (labelName, options) {
    options = options || {};
    if (!options.count) {
        options.count = 1;
    }
    if (!options.parameter) {
        return console.log('need parameter');
    }
    var parameter = options.parameter;
    this.printerName = config[labelName].printer;
    this.label = config[labelName].label;
    var printer = new Printer(this.printerName);
    console.log('Printer Option base: ' + theOptions.base);
    var filePath = path.join(__dirname, '../labels/' + this.label);
    var destFile = path.join(__dirname, 'temps', 'destination.pdf');
    console.log('filePath: ' + filePath);
    fs.readFile(filePath, 'utf8', function (err, htmlTemplate) {
        // console.log('Html template: ');
        // console.dir(htmlTemplate);
        // console.log('Type: '+ typeof (htmlTemplate));
        // console.log('Html template to string: '+ htmlTemplate.toString());
        if(err){
            return err;
        }
        var compiled = _.template(htmlTemplate.toString());
        var html = '';
        var i = 1;
        printLabel(compiled, parameter, i, options.count, printer, labelName);


    })
};