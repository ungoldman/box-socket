//= require lib/jquery
//= require_tree ./lib
//= require bootstrap/bootstrap-tooltip

(function(window,$,undefined){

  var socket, protobox, boxes = {};

  function drawBoard(){
    var field = $('#field')
      , w = 661
      , h = 421
      , dist = 60
      , canvas = $('<canvas/>').attr({width: w, height: h}).appendTo('#field')
      , ctx = canvas.get(0).getContext("2d");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#f1f1f1";
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

    socket.on('message', function(data){
      if (boxes[data.id]) clearTimeout(boxes[data.id]);
      $('#box-'+data.id)
        .tooltip('destroy')
        .tooltip({
          title: data.text,
          placement: 'top',
          trigger: 'manual',
          delay: { show: 500, hide: 100 }
        })
        .tooltip('show');
      boxes[data.id] = setTimeout(function(){
        $('#box-'+data.id).tooltip('destroy');
      },7500);
    });

    socket.on('user', function(user){
      if ($('#box-'+user.id).length > 0) return false;
      var $box = protobox.clone();
      $box.css({
        left: user.pos.x * 60 + 'px',
        top: user.pos.y * 60 + 'px',
      })
      .attr('id','box-'+user.id)
      .appendTo($('#field'));
    });

    socket.on('updatePosition', function(user){
      $('#box-'+user.id).stop().css({
        left: user.pos.x * 60 + 'px',
        top: user.pos.y * 60 + 'px'
      });
      setTimeout(function(){
        $('#box-'+user.id).tooltip('show');
      },200);
    });

    socket.on('disconnect', function(user){
      if(user != undefined) $('#box-'+user.id).remove();
    });

    $.map(['left','right','up','down'], function(n,i){
      key(n, function(){
        socket.emit('move', { direction: n });
        return false;
      });
    });

    key('enter',function(){
      $('<form/>').submit(function(e){
        e.preventDefault();
        if ($('#send').val() != '') socket.emit('message',$('#send').val());
        $(this).remove();
      })
      .append('<input type="text" id="send" placeholder="type your message">')
      .appendTo('#wrap').find('#send').focus();
      return false;
    });
  }

  $(init);

})(window,jQuery);
