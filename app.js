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


//ayfkm db
var users = {};
function addUser(obj){ users[obj.id] = obj.pos }
/* teh future:
use a two-dimensional array to
track users and collisions, e.g.
var map =
[
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,j,k,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0]
]
j tries to move right, k is already there, x absorbs y?
amoeba, the game! how do you deal with growth in a multidimensional array?
e.g. objects that are larger than one cell?
probably use a different paradigm. :[

coordinate system along the lines of
j: {
  pos: {
    x: 3,
    y: 3
  }
}
equivalent to j's position above, or map[3][3]!! pretty cool.
(k would be map[3][4])

client can map position however it sees fit (e.g. pos.x * 60).
no need to track pixel position on server side. that's fucking crazy!

so the question for now, how to efficiently store and compare user positions
in the context of a two dimensional (or multi-dimensional) array? Would using
an actual array cause problems? (Too many connections accessing and writing
to same object?). Would be nice to have some kind of representative object to
map terrain properties to for future experiments. Maybe just have a couchdb doc
that queries for position -- one for users, one for terrain, even another one
for other weird objects, npcs, god knows what. hrmm....

async call to query for all objects in vicinity of player, extend single {}
with deets, send to user on init, update as necessary..
*/

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
