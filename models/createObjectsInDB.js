/**
 * Created by pi on 8/19/16.
 */
var Filler = require('./eq/Filler');
var Discharger = require('./eq/Discharger');
var Storage = require('./eq/Storage');
var Company = require('./eq/Company');
var Warehouse = require('./eq/Warehouse');
var Scale = require('./eq/Scale');
var Mixer = require('./eq/Mixer');
var Packer = require('./eq/Packer');
var Section = require('./eq/Section');
var Line = require('./eq/Line');
var GcObject = require('./eq/GcObject');

var Product = require('./pr/Product');
var IngredientComponent = require('./pr/IngredientComponent');
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
var Assembly = require('./pr/Assembly');
var LineCategory = require('../lib/stateAndCategory/lineCategory');
var GcsState = require('../lib/stateAndCategory/gcsState');
var StorageCategory = require('../lib/stateAndCategory/storageCategory');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');


var prefix = 'ns=1;s=PLC1';
var lines = [];
var nodeId = '';
var infos = [];
var pathInfo = '';
var type = '';
var segments = [];
var elements = [];






// fs.readFile('PLC.csv', 'utf8', function (err, data) {
//     if (err) {
//         console.log( err);
//     }
//     else {
//         lines = data.split('\n');
//         nodeId= 'ns=1;s=PLC1';
//         //remove header
//         lines.splice(0, 1);
//         console.log('PLC.csv , lines length: ' + lines.length);
//         lines.forEach(function (line) {
//
//             infos= [];
//             // log('D','line: ' + line);
//
//             if (line) {
//                 //first info is path; second info is type
//                 infos = line.split(',');
//             }
//
//             if (infos.length >= 2) {
//
//                 pathInfo = infos[0];
//                 type = infos[2];
//                 //remove double quotes
//                 pathInfo = pathInfo.substring(1, pathInfo.length-1);
//                 segments = pathInfo.split('.');
//                 // log('D','pathInfo: ' + pathInfo);
//                 if(segments[0] === 'Element'){
//                     var category = segments[1];
//                     var ident = segments[2].substring(1);
//                     var nodeId = prefix + '.' + segments.slice(0,3).join('.');
//                     console.log('nodeId: ' + nodeId);
//                     console.log(elements[ident]);
//                     if(!elements[ident]){
//                         elements[ident] =ident;
//                         GcObject.create({
//                             ident:ident,
//                             nodeId: nodeId,
//                             category: category
//                         }).then(function (newGcObject) {
//                             console.log('newGcObject: ');
//                             // console.dir(newGcObject);
//                         })
//                     }
//
//
//                 }else if(segments[0] === 'Unit'){
//
//
//                 }else if(segments[0] === 'Section'){
//
//
//                 }else if(segments[0] === 'Line'){
//
//                 }
//
//
//             }
//         });
//     }
//
// });

// GcObject.bulkCreate([
//     {
//         ident: '=A-0006-MXZ01',
//         nodeId: 'ns=1;s=PLC1.Element.SimpleMotor.=A-0006-MXZ01',
//         category: 'SimpleMotor'
//     },
//     {
//         ident: '=A-0002-MXZ01',
//         nodeId: 'ns=1;s=PLC1.Element.SimpleMotor.=A-0006-MXZ01',
//         category: 'SimpleMotor'
//     },
//     {
//         ident: '=A-0003-BZA19',
//         nodeId: 'ns=1;s=PLC1.Element.BeltMonitor.=A-0003-BZA19',
//         category: 'BeltMonitor'
//     },
//     {
//         ident: '=A-0004-KFC10',
//         nodeId: 'ns=1;s=PLC1.Element.FilterControl.=A-0004-KFC10',
//         category: 'FilterControl'
//     },
//     {
//         ident: '=A-1011-BLH01',
//         nodeId: 'ns=1;s=PLC1.Element.HighLevel.=A-1011-BLH01',
//         category: 'HighLevel'
//     }
//
// ]).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
//     return GcObject.findAll();
// }).then(function(gcObjects) {
//     console.log(gcObjects); // ... in order to get the array of user objects
// });
// UserGroup.bulkCreate([
//     {
//         ident: 'AdminGroup',
//         name: 'AdminGroup'
//     },
//     {
//         ident: 'CentralGroup',
//         name: 'CentralGroup'
//     },
//     {
//         ident: 'IntakeGroup',
//         name: 'IntakeGroup'
//     }
//
// ]).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
//     return UserGroup.findAll();
// }).then(function(usergroups) {
//     console.log(usergroups); // ... in order to get the array of user objects
// });
//
// User.bulkCreate([
//     {
//         userName: 'FLCos',
//         displayName: 'FLCos Engineer' ,
//         password: bcrypt.hashSync('123456', null, null),
//         isAdministrator:true,
//         isEngineer: true
//     },
//     {
//         userName: 'Admin',
//         displayName: 'Admin' ,
//         password: bcrypt.hashSync('123456', null, null),
//         isAdministrator:true,
//         isEngineer: false
//     }
// ]).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
//     return User.findAll();
// }).then(function(users) {
//     console.log(users); // ... in order to get the array of user objects
// });
//
// AccessRight.bulkCreate([
//     {
//         ident: 'MainPage',
//         name: 'MainPage'
//     },
//     {
//         ident: 'IntakePage',
//         name: 'IntakePage'
//     }
// ]).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
//     return AccessRight.findAll();
// }).then(function(acessRights) {
//     console.log(acessRights); // ... in order to get the array of user objects
// });
//
// Company.bulkCreate([
//     {
//         ident: '1001',
//         name: 'Muehlbauer' ,
//         category: 0,
//         address:'Wuxi China'
//     },
//     {
//         ident: '1002',
//         name: 'Buhler' ,
//         category: 0,
//         address:'Swizerland'
//     }
// ]).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
//     return Company.findAll();
// }).then(function(companys) {
//     console.log(companys) // ... in order to get the array of user objects
// });
//
// Product.bulkCreate([
//     {
//         ident: 'r1001',
//         name: 'Corn' ,
//         category: 0
//     },
//     {
//         ident: 'r1002',
//         name: 'Salt' ,
//         category: 0
//     },
//     {
//         ident: 'f1001',
//         name: 'f1001' ,
//         category: 1
//     },
//     {
//         ident: 'f1002',
//         name: 'f1002' ,
//         category: 1
//     }
// ]).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
//     return Product.findAll();
// }).then(function(products) {
//     console.log(products); // ... in order to get the array of user objects
// });
//
// Line.bulkCreate([
//     {
//         ident: 'INT1',
//         name: 'INT1' ,
//         category: LineCategory.ContinuousTransportLine,
//         state:GcsState.Passive
//     },
//     {
//         ident: 'INT2',
//         name: 'INT2' ,
//         category: LineCategory.ContinuousTransportLine,
//         state:GcsState.Passive
//     },
//     {
//         ident: 'MIX1',
//         name: 'MIX1' ,
//         category: LineCategory.BatchMixingLine,
//         state:GcsState.Passive
//     }
// ]).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
//     return Line.findAll();
// }).then(function(lines) {
//     console.log(lines); // ... in order to get the array of user objects
// });
//
// Storage.bulkCreate([
//     {
//         ident: '501',
//         name: 'INT1',
//         category:StorageCategory.GateStorage,
//         lineIdent: 'INT1'
//     },
//     {
//         ident: '502',
//         name: 'INT2',
//         category:StorageCategory.GateStorage,
//         lineIdent: 'INT2'
//     },
//     {
//         ident: '801',
//         name: 'HT1',
//         category:StorageCategory.HandTakeStorage,
//         lineIdent: 'MIX1'
//     },
//     {
//         ident: '901',
//         name: 'PK1',
//         category:StorageCategory.PackStorage,
//         lineIdent: 'MIX1'
//     },
//     {
//         ident: '902',
//         name: 'PK2',
//         category:StorageCategory.PackStorage,
//         lineIdent: 'MIX1'
//     },
//     {
//         ident: '001',
//         name: 'Bin001',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '002',
//         name: 'Bin002',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '003',
//         name: 'Bin003',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '004',
//         name: 'Bin004',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '005',
//         name: 'Bin005',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '006',
//         name: 'Bin006',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '007',
//         name: 'Bin007',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '008',
//         name: 'Bin008',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '009',
//         name: 'Bin009',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '010',
//         name: 'Bin010',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '011',
//         name: 'Bin011',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '012',
//         name: 'Bin012',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '013',
//         name: 'Bin013',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '014',
//         name: 'Bin014',
//         category:StorageCategory.BulkStorage
//     },
//     {
//         ident: '015',
//         name: 'Bin015',
//         category:StorageCategory.BulkStorage
//     },
//
// ]).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
//     return Storage.findAll();
// }).then(function(storages) {
//     console.log(storages); // ... in order to get the array of user objects
// });
//
// Section.bulkCreate([
//     {
//         ident: 'INT1S01',
//         name: 'INT1S01',
//         nodeId: 'ns=1;s=PLC1.Section.INT1S01',
//         LineId: 1,
//         state: 10
//     },
//     {
//         ident: 'INT2S01',
//         name: 'INT2S01',
//         nodeId: 'ns=1;s=PLC1.Section.INT2S01',
//         LineId: 2,
//         state: 10
//     },
//     {
//         ident: 'MIX1S01',
//         name: 'MIX1S01',
//         nodeId: 'ns=1;s=PLC1.Section.MIX1S01',
//         LineId: 3,
//         state: 10
//     },
//     {
//         ident: 'MIX1S02',
//         name: 'MIX1S02',
//         nodeId: 'ns=1;s=PLC1.Section.MIX1S02',
//         LineId: 3,
//         state: 10
//     },
//     {
//         ident: 'MIX1S03',
//         name: 'MIX1S03',
//         nodeId: 'ns=1;s=PLC1.Section.MIX1S03',
//         LineId: 3,
//         state: 10
//     },
//     {
//         ident: 'MIX1S04',
//         name: 'MIX1S04',
//         nodeId: 'ns=1;s=PLC1.Section.MIX1S04',
//         LineId: 3,
//         state: 10
//     },
//     {
//         ident: 'MIX1S05',
//         name: 'MIX1S05',
//         nodeId: 'ns=1;s=PLC1.Section.MIX1S05',
//         LineId: 3,
//         state: 10
//     }
//
// ]).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
//     return Section.findAll();
// }).then(function(sections) {
//     console.log(sections); // ... in order to get the array of user objects
// });

// Mixer.bulkCreate([
//     {
//         ident: 'mixer001',
//         name: 'mixer001',
//         state: 10,
//         weightMax: 1000,
//         weightMin: 200,
//         SectionId: 12
//     }
//
// ]).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
//     return Mixer.findAll();
// }).then(function(mixers) {
//     console.log(mixers); // ... in order to get the array of user objects
// });

Warehouse.bulkCreate([
    {
        ident: 'WH',
        name: 'raw material',
        category: 1
    },
    {
        ident: 'Dis1',
        name: 'Dispensary1' ,
        category: 2,
        lineIdent: 'MIX1'
    },
    {
        ident: 'HT1',
        name: 'hand add1' ,
        category: 3,
        lineIdent: 'MIX1'
    },
    {
        ident: 'PK1',
        name: 'packing1' ,
        category: 4,
        lineIdent: 'MIX1'
    },
    {
        ident: 'PK2',
        name: 'packing2' ,
        category: 4,
        lineIdent: 'MIX1'
    },
    {
        ident: 'FP',
        name: 'finished product' ,
        category: 5
    }
]).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
    return Warehouse.findAll();
}).then(function(warehouses) {
    console.log(warehouses); // ... in order to get the array of user objects
});

//temp
// Assembly.bulkCreate([
//     {
//         jobIdent: 'PO:000033',
//         name: 'PO:000033',
//         JobId: 46,
//         state: 10,
//         targetWeight: 65
//     }
//
// ]).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
//     return Assembly.findAll();
// }).then(function(assemblys) {
//     console.log(assemblys); // ... in order to get the array of user objects
// });