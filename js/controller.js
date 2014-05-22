var io = io.connect();

$(document).ready(function () {
  var steer,
      canvas,
      context,
      width,
      height,
      playerLabelFontSize,
      buttonLabelFontSize,
      buttonRadius,
      itemButton,
      gasButton,
      brakeButton,
      playerId,
      touchList,
      touches,
      buttons;

  // HELPER FUNCTIONS
  function init() {
    steer = new SteeringWheel();
    canvas = $('canvas')[0];
    context = canvas.getContext('2d');
    width = window.innerWidth;
    height = window.innerHeight;
    playerLabelFontSize = 42;
    buttonLabelFontSize = 20;
    buttonRadius = parseInt(width / 8);
    touchList = new TouchList();
    touches = {};
    buttons = {};

    canvas.width = width;
    canvas.height = height;
    $('body').width(width);
    $('body').height(height);
    context.rotate((Math.PI / 180) * 90);
    context.translate(height,0);
    context.scale(-1,-1);
    width -= height;
    height += width;
    width = height - width;

    drawLabel();
  }

  function buttonsInit() {
    var tmp;
    tmp = new Button({
      label: 'Item',
      x: buttonRadius * 1.2,
      y: (height - buttonRadius) * 0.95
    });
    buttons[tmp.label.toLowerCase()] = tmp;
    tmp = new Button({
      label: 'Gas',
      x: width - buttonRadius * 1.2,
      y: (height - buttonRadius) * 0.95
    });
    buttons[tmp.label.toLowerCase()] = tmp;
    tmp = new Button({
      label: 'Brake',
      x: width - buttonRadius * 1.2,
      y: (height - buttonRadius)*0.95 - 2 * (buttonRadius * 1.05)
    });
    buttons[tmp.label.toLowerCase()] = tmp;

    drawButtons();
  }

  function emit() {
    io.emit('turnAmount', steer.getTurnAmount());
  }

  function Button(prop) {
    this.label = prop.label;
    this.center = {
      x: prop.x,
      y: prop.y
    }
    this.bottomLeft = {
      x: prop.x - buttonRadius,
      y: prop.y - buttonRadius
    };
    this.pressed = false;
    this.size = buttonRadius * 2;
  }

  Button.prototype.onRelease = function () {
    var eventName = this.label.toLowerCase() + 'Off';

    this.pressed = false;
    io.emit(eventName, playerId);
    this.draw();
  }

  Button.prototype.onPress = function () {
    var eventName = this.label.toLowerCase() + 'On';

    this.pressed = true;
    io.emit(eventName, playerId);
    this.draw();
  };

  Button.prototype.draw = function () {
    var font = buttonLabelFontSize + 'pt sans-serif',
        labelWidth;

    context.clearRect(this.bottomLeft.x - 1, this.bottomLeft.y - 1, this.size + 2, this.size + 2);
    if (this.pressed) {
      context.fillStyle = '#000';
      context.strokeStyle = '#999';
    } else {
      context.fillStyle = '#fff';
      context.strokeStyle = '#000';
    }
    context.beginPath();
    context.arc(this.center.x, this.center.y, buttonRadius, 0, 2 * Math.PI, false);
    context.fill();
    context.stroke();
    if (this.pressed) {
      context.fillStyle = '#fff';
    } else {
      context.fillStyle = '#000';
    }
    context.font = font;
    labelWidth = context.measureText(this.label).width;
    context.fillText(this.label, this.center.x - parseInt(labelWidth / 2), this.center.y + parseInt(buttonLabelFontSize / 2.5));
  };

  Button.prototype.inBounds = function (point) {
    if (point.x >= this.bottomLeft.x && point.x <= this.bottomLeft.x + this.size
          && point.y >= this.bottomLeft.y && point.y <= this.bottomLeft.y + this.size) {
      return true;
    } else {
      return false;
    }
  }

  function drawButtons () {
    var key;
    for (key in buttons) {
      if (buttons.hasOwnProperty(key)) {
        buttons[key].draw();
      }
    }
  }

  function drawLabel () {
    var playerLabel = 'Not connected',
        metrics;

    if (typeof playerId !== 'undefined') {
      playerLabel = 'Player '+playerId;
    }
    context.font = playerLabelFontSize + 'pt sans-serif';

    context.clearRect(0, 0, width, playerLabelFontSize * 1.5);

    metrics = context.measureText(playerLabel);
    context.fillText(playerLabel, parseInt(width / 2) - parseInt(metrics.width / 2), playerLabelFontSize * 1.25);
  }

  function screenPointToCanvasPoint (point) {
    return {
      x: width - point.y,
      y: point.x
    };
  }

  function printDebug (debugText) {
    var x;

    context.clearRect(parseInt(width / 2) - 14 * 15, parseInt(height / 2) - 15, 14 * 20, 30);

    context.font = '14pt sans-serif';
    x = parseInt(width / 2) - parseInt(context.measureText(debugText).width / 2);
    context.fillStyle = '#d11';
    context.fillText(debugText, x, parseInt(height / 2));
  }

  // INIT
  init();
  buttonsInit();

  // EVENT HANDLERS
  $(canvas).on('touchstart', function () {
    var changedTouches,
        button,
        touch,
        point,
        evt,
        k;

    evt = event.originalEvent;
    changedTouches = event.changedTouches;
    touch = touchList.getEnteringTouch(changedTouches);
    point = screenPointToCanvasPoint({
      x: touch.pageX,
      y: touch.pageY
    });

    for (k in buttons) {
      if (buttons.hasOwnProperty(k)) {
        button = buttons[k];
        if (button.inBounds(point)) {
          button.onPress();
          touches[touch.identifier] = button;
          break;
        }
      }
    }
  });

  $(canvas).on('touchend', function () {
    var changedTouches,
        targetTouches,
        button,
        touch,
        evt,
        i;

    evt = event.originalEvent;
    changedTouches = event.changedTouches;
    targetTouches = event.targetTouches;
    touch = touchList.getExitingTouch(changedTouches, targetTouches);

    if (typeof touches[touch.identifier] !== 'undefined') {
      button = touches[touch.identifier];
      button.onRelease();
      delete touches[touch.identifier];
    }
  });

  io.on('disconnect', function () {
    // TODO
  });

  io.on('connectComplete', function (_playerId) {
    playerId = _playerId;
    drawLabel();
  });

  io.emit('connect', 'controller');

  // START SENDING DATA
  setInterval(emit, 50);
});