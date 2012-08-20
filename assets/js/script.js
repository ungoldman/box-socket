//= require lib/jquery
//= require_tree ./lib

(function(window,$,undefined){

  var socket
    , protobox
    , r = function(n){ return Math.round(Math.random()*n) }
    , findById = function(arr, id) {
        for (var i=0; i<arr.length; i++){
          if (+arr[i].id === +id) return arr[i];
        }
        throw "Couldn't find object with id: " + id;
      }
  ;

  function init(){
    socket = io.connect(location);
    protobox = $('<div class="box"/>');

    $('#welcome').fadeOut(4000, function(){ $(this).remove() });

    socket.on('message', function(data){
      ui.notify('Message', data)
      .effect('slide');
    });

    socket.on('user', function(user){
      if ($('#box-'+user.id).length > 0) return false;
      var $box = protobox.clone();
      $box.css({
        left: user.pos.x + 'px',
        top: user.pos.y + 'px',
      })
      .attr('id','box-'+user.id)
      .appendTo($('#field'));
    });

    socket.on('updatePosition', function(user){
      $('#box-'+user.id).stop().animate({
        left: user.pos.x + 'px',
        top: user.pos.y + 'px'
      },100);
    });

    socket.on('disconnect', function(user){
      if(user != undefined) $('#box-'+user.id).remove();
    });

    key('left',function(){
      socket.emit('move', {
        direction: 'left'
      });
      return false;
    });

    key('right',function(){
      socket.emit('move', {
        direction: 'right'
      });
      return false;
    });

    key('up',function(){
      socket.emit('move', {
        direction: 'up'
      });
      return false;
    });

    key('down',function(){
      socket.emit('move', {
        direction: 'down'
      });
      return false;
    });

    key('c',function(){
      var n = r(255);
      var o = r(255);
      $box.css({
        'background': 'rgba('+n+','+n+','+n+',0.3)',
        'border-color': 'rgba('+o+','+o+','+o+',0.6)'
      });
      return false;
    });

    key('enter',function(){
      $('<form><input type="text" id="text"/></form>').submit(function(e){
        e.preventDefault();
        socket.emit('message',$('#text').val());
        $(this).remove();
      }).appendTo('#wrap').find('#text').focus();
      return false;
    });
  }

  $(init);

})(window,jQuery);
