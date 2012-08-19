//= require lib/jquery
//= require_tree ./lib

(function(window,$,undefined){

  function init(){
    log('document ready');
    var $box = $('#box');

    $('#welcome').fadeOut(5000);

    var socket = io.connect(location);
    socket.on('message', function(data) {
      log(data);
      $('.messages').prepend(
        $('<p>').text(new Date().toLocaleTimeString() + ': ' + data)
      );
    });
    $('.message')
      .submit(function(e){
        e.preventDefault();
        $msg = $(this).find('.text');
        socket.emit('message',$msg.val());
        $msg.val('');
      })
      .find('.text').focus();

    key('left',function(){
      socket.emit('move','left');
    });

    key('right',function(){
      socket.emit('move','right');
    });

    key('up',function(){
      socket.emit('move','up');
    });

    key('down',function(){
      socket.emit('move','down');
    });

    socket.on('move', function(dir){
      var left = parseInt($box.css('left'));
      var top  = parseInt($box.css('top'));
      switch(dir){
        case 'left':
          $box.css('left', left-100 + 'px');
          break;
        case 'right':
          $box.css('left', left+100 + 'px');
          break;
        case 'up':
          $box.css('top', top-100 + 'px');
          break;
        case 'down':
          $box.css('top', top+100 + 'px');
          break;
        default:
          console.log('not good');
      };
    });
  };

  $(function(){
    init();
  });

})(window,jQuery);
