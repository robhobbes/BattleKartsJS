$(document).ready(function () {
  var canvas = $('canvas')[0],
      context=  canvas.getContext('2d');
      width = window.innerWidth,
      height = window.innerHeight*0.99;
      radius = Math.min(height,width) / 3,
      turnAmount = 0,
      io = io.connect();

  io.emit('connect', 'test');

  io.on('turnAmount', function (_turnAmount) {
    turnAmount = _turnAmount;
  });

  canvas.width = width;
  canvas.height = height;

  context.strokeStyle = '#368';
  context.lineWidth = 3;

  context.translate(width/2,height/2);
  context.scale(1,-1);

  function draw() {
    var degrees = turnAmount * 45,
        radians = degrees * Math.PI / 180,
        p1 = {
          x: Math.cos(radians) * radius,
          y: Math.sin(radians) * radius,
        },
        p2 = {
          x: -Math.cos(radians) * radius,
          y: -Math.sin(radians) * radius
        }

    context.clearRect(-width/2,-height/2,width,height);
    drawLine(p1,p2);
  }

  function drawLine(p1,p2) {
    context.beginPath();
    context.moveTo(p1.x,p1.y);
    context.lineTo(p2.x,p2.y);
    context.stroke();
  }

  setInterval(draw,50);
});