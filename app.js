
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
	 	http = require('http'),
	 	path = require('path'),
	 	classDefine = require('./classDefine'),
    flash = require('connect-flash'),
   	app = express(),
   	mongoose = require('mongoose'),
   	Schema = mongoose.Schema,
   	egouClass;

//express 设置
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({
  uploadDir:"public/images/tmpImg"
}));
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: "my secret" }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(function(req, res, next){
  var err = req.flash('error');
  res.locals.error = err.length? err : null;
  res.locals.session = req.session;
  next();
});
app.use(app.router);
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


http.createServer(app).listen(app.get('port'), function(){
  console.log('\033[96m Express server listening on port \033[39m' + app.get('port'));
});


//连接数据库
mongoose.connect('mongodb://localhost/egou');
var db = mongoose.connection;

db.on('error', function(err){
  console.log(err);
});


db.once('open', function(){
  egouClass = new classDefine();
  //路由
  routes(app, egouClass);
});