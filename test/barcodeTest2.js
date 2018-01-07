/**
 * Created by pi on 9/6/16.
 */
var barcode = require('barcode');

var path = require('path');
var fs = require('fs');
var code39 = barcode('code39', {
    data: "r1001-20160906-0001",
    width: 500,
    height: 100,
});
var outfile = path.join(__dirname, '../temps/imgs', 'mycode2.png');
code39.saveImage(outfile, function (err) {

    if (err) throw err;
    console.log('File has been written!');

});

code39.getBase64(function (err, imgsrc) {
    if (err) throw err;

    res.end('<img src="' + imgsrc + '">')
})