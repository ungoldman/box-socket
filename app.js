var express = require('express')
  , app = express()

  , partials = require('express-partials')
  , assets = require('connect-assets')
  , info = require('./package.json')
;

app
  .set('port', process.env.PORT || 3000)
  .set('views', __dirname + '/views')
  .set('view engine', 'ejs')
  .use(express.favicon())
  .use(express.bodyParser())
  .use(express.methodOverride())
  .use(express.cookieParser('your secret here'))
  .use(express.session())
  .use(express.staticCache())
  .use(express.static(__dirname + '/public'))
  .use(partials())
  .use(assets())

  .configure('development', function(){
    app
      .use(express.logger('dev'))
      .use(express.errorHandler({ dumpExceptions: true, showStack: true }))
  })

  .configure('production', function(){
    app
      .use(express.logger())
      .use(express.errorHandler())
  })

  .use(app.router)
;

app.get('/', function(req, res){
  res.render('index', {
    title: info.name,
    version: info.version
  });
});

var server = app.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);

io.on('connection', function(socket){
  socket.emit('message', 'user connected');
  socket.on('message', function(data){
    io.sockets.emit('message', data);
  });
  socket.on('move', function(dir){
    io.sockets.emit('move',dir);
  });
});
