/**
 * Created by jacques on 10-11-16.
 */
var winston = require("winston");
var lobby = require("./lobby.js");
var eventEnum = require("../common/events.js");
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 8080;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));


io.on("connection", function (socket) {

    socket.on(eventEnum.NewPlayer, function(data) {
        lobby.newPlayer(data, function (err,player) {
            if (err) {
                // à déterminer
            } else {
                socket.emit(eventEnum.NewPlayer, player);
            }
        });

    });
    
    socket.on(eventEnum.GetAvailableRooms , function () {
        lobby.listRooms( function (err,rooms) {
            if (err) {
                // à déterminer
            } else {
                socket.emit(eventEnum.GetAvailableRooms, rooms);
            }
        });
    });

    socket.on(eventEnum.JoinRoom , function (data) {
       lobby.joinRoom(data, function (err,answer) {
          if (err) {
              // à déterminer
          }  else {
              socket.join(answer["name"]);
              socket.emit(eventEnum.JoinRoom, answer);
          }
       });
    });

    socket.on(eventEnum.StartGame , function (data) {
        lobby.startGame(data, function (err,answer) {
            if (err) {
                // à déterminer
            } else {
                io.emit(eventEnum.StartGame, answer);
            }
        });
    });

    socket.on(eventEnum.DeleteRoom, function (data) {
        lobby.deleteRoom(data, function (err,answer) {
           if (err) {
               // à déterminer
           } else {
               // tell players that the room is deleted
                io.in(data["name"]).emit(eventEnum.DeleteRoom, answer);
                // to be tested ? : remove the room from Socket
                io.sockets.in(data["name"]).leave(data["name"]);
           }
        });
    });

});

