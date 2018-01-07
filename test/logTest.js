/**
 * Created by pi on 9/10/16.
 */
var theTime = new Date();
var theYear = theTime.getFullYear();
var theMonth = theTime.getMonth() + 1;
var theDay = theTime.getDate();
var log = require('../lib/log');
// var theHour = theTime.getHours();
console.log('theYear: ' + theYear);
console.log('theMonth: ' + theMonth);
console.log('theDay: ' + theDay);

// console.log('theHour: ' + theHour);
// console.log('toDateString: ' + theTime.toDateString());
// console.log('toISOString: ' + theTime.toISOString());
// console.log('toLocaleDateString: ' + theTime.toLocaleDateString());
// console.log('toLocaleString: ' + theTime.toLocaleString());
// console.log('toLocaleTimeString: ' + theTime.toLocaleTimeString());
// console.log('toTimeString: ' + theTime.toTimeString());
// console.log('toUTCString: ' + theTime.toUTCString());
//
// console.log('toExponential: ' + Date.now().toExponential());
// console.log('toFixed: ' + Date.now().toFixed());
// console.log('toPrecision: ' + Date.now().toPrecision());
// console.log('toPrecision: ' + Date.now().toString());
// log.debug({error:'test error'});
// log.info(function () {
//     var test =1;
//     var test2 = '';
// });
// log.warn([1,2,3]);
