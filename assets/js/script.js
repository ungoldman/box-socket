//= require lib/jquery
//= require_tree ./lib
//= require bootstrap/bootstrap-tooltip

(function(window,$,undefined){

  var socket, protobox;

  window.box = {};

  function drawBoard(){
    //grid width and height
    var field = $('#field')
      , w = 661
      , h = 421
      , dist = 60
      , canvas = $('<canvas/>').attr({width: w, height: h}).appendTo('#field')
      , ctx = canvas.get(0).getContext("2d");

    ctx.globalCompositeOperation = "source-over"
    ctx.fillStyle                = "#f1f1f1"
    ctx.fillRect(0, 0, w, h);

    for (var x = 0; x <= w; x += dist) {
      ctx.moveTo(0.5 + x, 0);
      ctx.lineTo(0.5 + x, h);
    }

    for (var x = 0; x <= h; x += dist) {
      ctx.moveTo(0, 0.5 + x);
      ctx.lineTo(w, 0.5 + x);
    }

    ctx.strokeStyle = "#bbb";
    ctx.stroke();
  }

  function init(){
    // drawBoard();
    socket = io.connect(window.location.hostname);
    protobox = $('<div class="box"/>');

    $('#welcome').fadeOut(4000, function(){ $(this).remove() });

    socket.on('welcome',function(data){
      ui.notify(data.title, data.version).effect('slide');
    })

    socket.on('message', function(data){
      if (window.box[data.id]) clearTimeout(window.box[data.id]);
      $('#box-'+data.id)
        .tooltip('destroy')
        .tooltip({
          title: data.text,
          placement: 'top',
          trigger: 'manual',
          delay: { show: 500, hide: 100 }
        })
        .tooltip('show');
      window.box[data.id] = setTimeout(function(){
        $('#box-'+data.id).tooltip('destroy');
      },7500);
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
      $('#box-'+user.id).stop().css({
        left: user.pos.x + 'px',
        top: user.pos.y + 'px'
      });
      setTimeout(function(){
        $('#box-'+user.id).tooltip('show');
      },200);
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

    key('enter',function(){
      $('<form><input type="text" id="send" placeholder="type your message"></form>').submit(function(e){
        e.preventDefault();
        if ($('#send').val() != '') socket.emit('message',$('#send').val());
        $(this).remove();
      }).appendTo('#wrap').find('#send').focus();
      return false;
    });
  }

  $(init);

})(window,jQuery);
