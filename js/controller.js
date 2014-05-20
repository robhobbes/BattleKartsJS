var io = io.connect();

$(document).ready(function () {
  var steer = new SteeringWheel(),
      canvas = $('canvas')[0],
      context = canvas.getContext('2d'),
      width = window.innerWidth,
      height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  context.fillRect(10,10,10,20);    

  io.on('disconnect', function () {
    // TODO
  });

  io.on('connectComplete', function (playerId) {
    $('#player').text('Player '+playerId);
  });

  function emit() {
    io.emit('turnAmount', steer.getTurnAmount());
  }

  function draw() {
    
  }

  setInterval(emit, 50);
});