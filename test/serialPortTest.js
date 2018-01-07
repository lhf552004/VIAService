/**
 * Created by pi on 9/22/16.
 */
var SerialPort = require('serialport');
// SerialPort.list(function (err, ports) {
//     if(err){
//         console.log('Error: ' + err);
//     }
//     ports.forEach(function(port) {
//         console.log(port.comName);
//         console.log(port.pnpId);
//         console.log(port.manufacturer);
//         console.dir(port);
//     });
// });

var port = new SerialPort('/dev/ttyS1',{parser: SerialPort.parsers.raw});
// var port = new SerialPort('/dev/ttyS1');
// var port = new SerialPort('/dev/ttyS2');
// var port = new SerialPort('/dev/ttyS3');

port.on('open', function(openErr) {
    if(openErr){
        return console.log('Error opening port: ', openErr.message);
    }
    port.write('main screen turn on\n', function(err) {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('message written');
    });
});
port.on('data', function (data) {
    console.log('Data: ' + data);
});

// open errors will be emitted as an error event
// port.on('error', function(err) {
//     console.log('Error: ', err.message);
// })
//
//
// port.on('data', function (data) {
//     console.log('Data: ' + data);
// });
//
// var SerialPort = require('serialport');
// var port = new SerialPort('/dev/ttyS1', { autoOpen: false });
//
// port.open(function (err) {
//     if (err) {
//         return console.log('Error opening port: ', err.message);
//     }
//
//     // write errors will be emitted on the port since there is no callback to write
//     port.write('main screen turn on');
// });
//
// // the open event will always be emitted
// port.on('open', function() {
//     // open logic
// });