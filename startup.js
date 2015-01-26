var express = require('express')
  , http = require('http')
  , path = require('path')
  , PlayRTCHelper = require("./service_helper/PlayRTCHelper");

var app = express();

app.engine('html', require('hogan-express'));
app.enable('view cache');

// all environments
app.set('port', 5400);
app.set('views', __dirname + '/');
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '/')));

app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', "*");
	res.header('Access-Control-Allow-Credentials', "true");
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, Content-Length');
    
    if ('OPTIONS' === req.method) {
    	res.send(200);
	}
	else{
		next();
	}
});

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// static resource url mapping
app.get('/', function(req, res){
	res.render('index');
});

var helper = new PlayRTCHelper.Helper({
	app: app,
//	projectKey: "de410051-b323-4901-9734-abb15d830fad" // 내꼬
	projectKey: "60ba608a-e228-4530-8711-fa38004719c1"
});


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


