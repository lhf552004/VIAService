var path = require('path');
var toArray = require('stream-to-array');
var Printer = require('node-printer');
var printer = new Printer('HP-LaserJet-5200-2');
var stream = require('stream');
var writeStream = stream.Writable;
var barcode = require('barcode');
var fs = require('fs');
var code39 = barcode('code39', {
    data: "R001-20160811-0001",
    width: 500,
    height: 100,
});
var _ = require('underscore');
var options = {
    media: 'Custom.200x600mm',
    n: 3
};
var htmlToPdf = require('html-to-pdf');






var htmlTemplate = '<!DOCTYPE html>' +
    '<html>' +
      '<head>' +
          '<meta charset="UTF-8">' +
          '<title>FLCos</title>' +
          '<link rel="stylesheet" href="public/vendor/Bootstrap/css/bootstrap.css" media="all" />'+
          '<script src="public/vendor/jquery/jquery-1.9.1.js"></script>' +
          '<script src="public/vendor/Bootstrap/js/bootstrap.min.js"> </script>' +
      '</head>' +
      '<body>' +
         '<div class="container" >' +
             '<div class="row">' +
                  '<div class="col-lg-8">' +
                     '<h2>Receipt Detail</h2>' +
                  '</div>' +
                '<div class="col-lg-6">' +
                    '<div class="form-group">' +
                         '<label class="col-md-2 control-label">Ident  </label><%= Ident %>' +
                    '</div>' +
                '</div>' +
                '<div class="col-lg-6">' +
                    '<div class="form-group">' +
                        '<label class="col-md-2 control-label">Name   </label><%= Name %>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="col-lg-6">' +
                    '<div class="form-group">' +
                        '<label class="col-md-2 control-label">Supplier  </label><%= Supplier %>' +
                    '</div>' +
                '</div>' +
                '<div class="col-lg-6">' +
                    '<div class="form-group">' +
                        '<label class="col-md-4 control-label">Lot  </label><%= Lot %>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="col-lg-6">' +
                    '<div class="form-group">' +
                       '<img src="imgs/mycode.png" alt="barcode" />' +
                    '</div>' +
                '</div>' +
            '</div>' +
         '</div>' +
      '</body>' +
    '</html> ';
//Some HTML String from code above
var compiled = _.template(htmlTemplate);
var html = compiled({
    Ident: 'R001',
    Name: 'Corn',
    Supplier : 'MB',
    Lot: '20160811',
    BagNo: '0001'
});
// console.log('html: ' + html);
// htmlToPdf.setDebug(true);



var labelFile = path.join(__dirname,  'label.html');
var destFile = path.join(__dirname,  'temp','destination.pdf');
var barcodeBase = path.join(__dirname, 'imgs');
console.log('labelFile: ' + labelFile);
console.log('barcode base: ' + __dirname);
var pdf = require('html-pdf');
var thehtml = fs.readFileSync(labelFile, 'utf8');
var theoptions = {
    // height: "120cm",        // allowed units: mm, cm, in, px
    // width: "80cm",
    format: 'Letter',
    base: 'file:///' + __dirname + '/'
};

pdf.create(thehtml, theoptions).toFile(destFile, function(err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
    var outfile = res.filename;
    var jobFromFile = printer.printFile(outfile);
    jobFromFile.once('sent', function () {
        jobFromFile.on('completed', function () {
            console.log('Job ' + jobFromFile.identifier + ' has been printed');
            jobFromFile.removeAllListeners();
        });
    });

});



// htmlToPdf.convertHTMLString(html, destFile,
//     function (error, success) {
//         if (error) {
//             console.log('Oh noes! Errorz!');
//             console.log(error);
//         } else {
//             console.log('Woot! Success!');
//             console.log(success);
//         }
//     }
// );


// htmlToPdf.convertHTMLFile(labelFile, destFile,
//     function (error, success) {
//         if (error) {
//             console.log('Oh noes! Errorz!');
//             console.log(error);
//         } else {
//             console.log('Woot! Success!');
//             console.log(success);
//         }
//     }
// );
// var compiled = _.template("                     Receipt Label                    \n" +
//     "   Ident   <%= Ident %>                \n" +
//     "   Name    <%= Name %>                 \n" +
//     "   Lot     <%= Lot %>                  \n" +
//     "   BagNo   <%= BagNo %>                \n" +
//     "\n" +
//     "\n" +
//     "\n");
// var textToPrint = compiled({
//     Ident: 'R001',
//     Name: 'Corn',
//     Lot: '20160811',
//     BagNo: '0001'
// });
// var labelFile = path.join(__dirname, 'temp', 'label.png');
// var outfile = path.join(__dirname, 'imgs', 'mycode.png');
// var ws = fs.createWriteStream(labelFile);
// var Readable = require('stream').Readable;
// var s = new Readable;
// console.log(textToPrint);
// s.push(textToPrint);  // the string you want
// s.push(null);
//
// // s.pipe(ws);
//
// var rs = fs.createReadStream(outfile);
// rs.pipe(ws);

// var jobFromBuffer = printer.printBuffer(ws, options);
// jobFromBuffer.once('sent', function () {
//     jobFromBuffer.on('completed', function () {
//         console.log('Job ' + jobFromBuffer.identifier + ' has been printed');
//         jobFromBuffer.removeAllListeners();
//     });
// });
// fs.readFile(outfile, function (err, data) {
//
//     console.log('Text to print: ' + textToPrint);
//     fs.writeFile(labelFile, textToPrint, function (err) {
//         if (err) {
//             return console.log(err);
//         }
//
//         console.log("The file was saved!");
//
//
//         var jobFromFile = printer.printFile(labelFile);
//         jobFromFile.once('sent', function () {
//             jobFromFile.on('completed', function () {
//                 console.log('Job ' + jobFromFile.identifier + ' has been printed');
//                 jobFromFile.removeAllListeners();
//             });
//         });
//     });
//
//
// });


//
// code39.saveImage(outfile, function (err) {
//
//     if (err) throw err;
//     console.log('File has been written!');
//     var jobFromFile = printer.printFile(outfile);
//     jobFromFile.once('sent', function () {
//         jobFromFile.on('completed', function () {
//             console.log('Job ' + jobFromFile.identifier + ' has been printed');
//             jobFromFile.removeAllListeners();
//         });
//     });
// });
// console.log('the program ended!');

// code39.getStream(function (err, readStream) {
//     if (err) throw err;
//     console.log('--------------------------------');
//     // 'readStream' is an instance of ReadableStream
//
//     toArray(readStream, function (err2, arr) {
//         console.log('err: ' + err2);
//         if (err2) {
//             throw err2;
//         }
//         console.log('arr is Array? ' + Array.isArray(arr));
//         console.log('arr: ' + arr);
//         var buffeToPrint = new Buffer(arr);
//         console.log( "Buffer to string : " + buffeToPrint.toString());
//         console.log('buffeToPrint is Buffer? ' + Buffer.isBuffer(buffeToPrint));
//         console.log('buffeToPrint: ' + buffeToPrint);
//         // var jobFromBuffer = printer.printBuffer(buffeToPrint,options);
//         // jobFromBuffer.once('sent', function () {
//         //     jobFromBuffer.on('completed', function () {
//         //         console.log('Job ' + jobFromBuffer.identifier + ' has been printed');
//         //         jobFromBuffer.removeAllListeners();
//         //     });
//         // });
//     });
//
//     //readStream.pipe(CdnWriteStream);
// });

