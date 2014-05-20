var app = require('http').createServer(handler),
    io = require('socket.io').listen(app, {log: true}),
    fs = require('fs'),
    port = process.env.PORT || 3000;

// TODO, figure out to get rid of weird skipping from the controllers
// (maybe has something to do with socket.io heartbeat)

var playerId = 0,
    gameSocket,
    testSocket;

function handler(req, res) {
  var url = req.url,
      path = 'views' + req.url + '.html';

  if (url.indexOf('/js/') === 0) {
    path = 'js/' + url.substring(4);
  } else if (url.indexOf('/css/') === 0) {
    path = 'css/' + url.substring(5);
  }

  fs.readFile(path, function (err, data) {
    if (err) {
      res.writeHead('404');
      res.end('404 - Not Found');
    } else {
      res.writeHead('200');
      res.end(data);
    }
  });
}

io.sockets.on('connection', function (socket) {

  socket.on('disconnect', function () {
    // TODO
    //gameSocket.emit('playerDisconnect', this.playerId);
  });

  socket.on('connect', function (data) {
    socket.emit('connectComplete');
    if (data === 'test') {
      testSocket = socket;
    } else if (data === 'game') {
      gameSocket = socket;
    } else if (data === 'controller') {
      socket.playerId = playerId++;
      socket.emit('connectComplete', socket.playerId);
      if (gameSocket) {
        gameSocket.emit('connectComplete', socket.playerId)
      }
    }
  });

  socket.on('turnAmount', function (turnAmount) {
    if (testSocket) {
      testSocket.emit('turnAmount', turnAmount);
    }
  });
});

//Start the server
app.listen(port);