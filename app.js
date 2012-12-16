var express = require('express')
  , app = express()
  , partials = require('express-partials')
  , assets = require('connect-assets')
  , info = require('./package.json');

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
  .use(app.router);

var users = {};

function addUser(obj){ users[obj.id] = obj.pos }

function updatePosition(user, direction){
  var incr = 1
    , horiz = 6
    , vert = 10;

  switch(direction){
  case 'left':
    if (user.pos.x <= 0) return false;
    user.pos.x -= incr;
    break;
  case 'right':
    if (user.pos.x >= vert) return false;
    user.pos.x += incr;
    break;
  case 'up':
    if (user.pos.y <= 0) return false;
    user.pos.y -= incr;
    break;
  case 'down':
    if (user.pos.y >= horiz) return false;
    user.pos.y += incr;
    break;
  default:
    console.log('not good');
    return false;
  };
  return true;
}

app.get('/', function(req, res){
  res.render('index', {
    name: info.name,
    version: info.version
  })
});

var server = app.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);

// for heroku
if(process.env.LONG_POLLING_REQUIRED){
  io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
  });
}

io.on('connection', function(socket){
  // instantiate user
  var user = {
    id: Date.now(),
    pos: { x: 0, y: 0 }
  };
  io.sockets.emit('user',user);
  for (var id in users) { socket.emit('user', { id: id, pos: users[id] }) }
  addUser(user);

  // receive messages
  socket.on('message', function(data){
    io.sockets.emit('message', {
      id: user.id,
      text: data
    })
  });

  // receive moves
  socket.on('move', function(data){
    var update = updatePosition(user, data.direction);
    if (update) io.sockets.emit('updatePosition',user);
  });

  // disconnect
  socket.on('disconnect', function(){
    delete users[user.id];
    io.sockets.emit('disconnect', user);
  });
});
