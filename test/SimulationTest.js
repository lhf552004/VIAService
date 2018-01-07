/**
 * Created by pi on 9/14/16.
 */
var ints01StaFaultNodeId = 'ns=1;s=PLC1.Section.INT1S01.States.StaFault';
var ints01StaStartedNodeId = 'ns=1;s=PLC1.Section.INT1S01.States.StaStarted';
var ints01StaStartingNodeId = 'ns=1;s=PLC1.Section.INT1S01.States.StaStarting';
var ints01StaStoppedNodeId = 'ns=1;s=PLC1.Section.INT1S01.States.StaStopped';
var ints01StaStoppingNodeId = 'ns=1;s=PLC1.Section.INT1S01.States.StaStopping';
var GcObjectAdapter = require('../lib/adapters/gcObjectAdapter');

new GcObjectAdapter(io).then(function (gcObjectAd) {

    setTimeout(function () {

    })
})