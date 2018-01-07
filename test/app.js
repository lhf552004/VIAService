var express = require('express'),
    app = express();
var handlebars = require('express3-handlebars')
    .create({
        defaultLayout:'main',
        helpers: {
            section: function (name, options) {
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });



// setup hbs
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


app.use(express.static(__dirname + '/public'));
app.use(function (req,res,next) {

    next();
});

// serving homepage
app.get('/', function (req, res) {
    res.render('home');
});
app.get('/about', function(req, res){
    res.render('about', {
        lucky: "you are lucky."
    });
});
// 定制404 页面
app.use(function(req, res, next){
    res.status(404);
    res.render('404');
});
// 500 错误处理器（中间件）
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});
// startup
app.listen(3000, function() {
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});