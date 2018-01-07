/**
 * Created by pi on 8/15/16.
 */
// server.js

// set up ======================================================================
// get all the tools we need
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var port = process.env.PORT || 80;
var i18n = require('i18n');
var passport = require('passport');
var flash = require('connect-flash');
var EventEmitter = require("events").EventEmitter;
var handlebars = require('express3-handlebars')
    .create({
        defaultLayout: 'main',
        helpers: {
            section: function (name, options) {
                if (!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            },
            __: function () {
                return i18n.__.apply(this, arguments);
            },
            __n: function () {
                return i18n.__n.apply(this, arguments);
            }
        }
    });
var server = require('http').createServer(app),
    io = require('socket.io')(server);
var menus = require('./lib/tools/menu');
var navs = require('./lib/tools/navigation');
//var GcObjectAdapter = require('./lib/adapters/gcObjectAdapter');
//var ControllerManager = require('./lib/controllers/controllerManager');
var log = require('./lib/log');
// log.debug('io is equal to ioJob: ' + (io ===ioJob));
//global settings===============================================================
require('enum').register();
global.i18n = i18n;
global.myEventEmitter = new EventEmitter();
global.myEventEmitter.setMaxListeners(10000);
// configuration ===============================================================
require('./config/passport')(passport); // pass passport for configuration

i18n.configure({
    // setup some locales - other locales default to en silently
    locales: ['en', 'zh', 'ru'],

    // fall back from Dutch to German
    fallbacks: {'nl': 'de'},

    // you may alter a site wide default locale
    defaultLocale: 'de',

    // sets a custom cookie name to parse locale settings from - defaults to NULL
    cookie: 'locale',

    // query parameter to switch locale (ie. /home?lang=ch) - defaults to NULL
    queryParameter: 'lang',

    // where to store json files - defaults to './locales' relative to modules directory
    directory: __dirname + '/locales',

    // controll mode on directory creation - defaults to NULL which defaults to umask of process user. Setting has no effect on win.
    directoryPermissions: '755',

    // watch for changes in json files to reload locale on updates - defaults to false
    autoReload: true,

    // whether to write new locale information to disk - defaults to true
    updateFiles: true,

    // sync locale information accros all files - defaults to false
    syncFiles: false,

    // what to use as the indentation unit - defaults to "\t"
    indent: "\t",

    // setting extension of json files - defaults to '.json' (you might want to set this to '.js' according to webtranslateit)
    extension: '.json',

    // setting prefix of json files name - default to none '' (in case you use different locale files naming scheme (webapp-en.json), rather then just en.json)
    prefix: '',

    // enable object notation
    objectNotation: false,

    // // setting of log level DEBUG - default to require('debug')('i18n:debug')
    // logDebugFn: function (msg) {
    //     console.log('debug', msg);
    // },

    // setting of log level WARN - default to require('debug')('i18n:warn')
    logWarnFn: function (msg) {
        console.log('warn', msg);
    },

    // setting of log level ERROR - default to require('debug')('i18n:error')
    logErrorFn: function (msg) {
        console.log('error', msg);
    },

    // object or [obj1, obj2] to bind the i18n api and current locale to - defaults to null
    register: global,

    // hash to specify different aliases for i18n's internal methods to apply on the request/response objects (method -> alias).
    // note that this will *not* overwrite existing properties with the same name
    api: {
        '__': 't',  //now req.__ becomes req.t
        '__n': 'tn' //and req.__n can be called as req.tn
    }
});

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// required for passport
app.use(session({
    secret: 'vidyapathaisalwaysrunning',
    resave: true,
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(i18n.init);
app.use(express.static(__dirname + '/public'));

app.use(function (req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    if (!res.locals.partials) res.locals.partials = {};
    i18n.setLocale(i18n, req.locale);
    res.locals.partials.menus = menus(i18n);
    res.locals.partials.navigations = navs(res.locals.partials.menus);
    res.locals.partials.naviStr = JSON.stringify(res.locals.partials.navigations);
    console.log('processing request for "' + req.url + '"....');

    next();
});
// routes ======================================================================
require('./routes/index')(app, passport); // load our routes and pass in our app and fully configured passport
require('./routes/receipt')(app, i18n);
require('./routes/processOrder')(app, i18n);
require('./routes/recipe')(app, i18n);
require('./routes/mixer')(app, i18n);
require('./routes/jobLog')(app, i18n);
require('./routes/product')(app, i18n);
require('./routes/warehouse')(app, i18n);
require('./routes/dispensary')(app, i18n);
require('./routes/macro')(app, i18n);
require('./routes/handAdd')(app, i18n);



// 定制404 页面
app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
});
// 500 错误处理器（中间件）
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});
// io.on('connection', function (socket) {
//     console.log('io socket connection success!');
//     new GcObjectAdapter(socket).then(function (gcObjectAd) {
//         console.log('gcobjectAdapter created success!');
//         gcObjectAd.DataType = opcua.DataType;
//
//         new ControllerManager().then(function (controllerManager) {
//             require('./routes/job')(app,controllerManager, i18n,socket);
//         });
//         require('./routes/line')(app,gcObjectAd, i18n,socket);
//         require('./routes/storage')(app,gcObjectAd, i18n,socket);
//         require('./routes/gcObject')(app,gcObjectAd, i18n,socket);
//
//         // gcObjectAd.getItemsValue(nodeId, function (err,theNodeId, data) {
//         //     console.log('data: ');
//         //     console.dir(data);
//         //     console.log('read nodeId: ' + nodeId + '. value: ' + data.value.value);
//         //     console.log('read nodeId: ' + nodeId + '. type: ' + data.value.dataType);
//         // });
//         // var data = {
//         //     type: opcua.DataType.Boolean,
//         //     value: true
//         // };
//         // console.log('data to write:');
//         // console.dir(data);
//         // gcObjectAd.setItemValue(nodeId, data, function (error) {
//         //     if(!error){
//         //         console.log('write successfully');
//         //     }else {
//         //         console.log('error: ' +  error);
//         //     }
//         //
//         // });
//     });
//
//     // var GCObjects = [
//     //     {
//     //         id: 'A_1001_MXZ01',
//     //         State: 30
//     //     },
//     //     {
//     //         id: 'A_1003_QXV01',
//     //         State: 40
//     //     }
//     // ];
//     // var GCObjectsStr = JSON.stringify(GCObjects);
//     // socket.emit('GCObjectUpdate', GCObjects);
//     // console.log('Have send event to client');
//     // socket.on('my other event', function (data) {
//     //     console.log(data);
//     // });
// });


// io.on('connection', function (socket) {
//     // var GCObjects = [
//     //     {
//     //         id: 'A_1001_MXZ01',
//     //         State: 30
//     //     },
//     //     {
//     //         id: 'A_1003_QXV01',
//     //         State: 40
//     //     }
//     // ];
//     // var GCObjectsStr = JSON.stringify(GCObjects);
//     // socket.emit('GCObjectUpdate', GCObjects);
//     // console.log('Have send event to client');
//     // socket.on('my other event', function (data) {
//     //     console.log(data);
//     // });
// });

// launch ======================================================================
server.listen(port);
console.log('The magic happens on port ' + port);