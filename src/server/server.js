/**
 * Created by jacques on 10-11-16.
 */
var winston = require("winston");
var lobby = require("./lobby.js");
var eventEnum = require("../common/events.js");
var io = require('socket.io')(8080);

io.on("connection", function (socket) {

    socket.on(eventEnum.NewPlayer, function(data) {
        lobby.newPlayer(socket, data, function (err) {
            winston.log("Requête " + eventEnum.newPlayer + " traitté : " + (err != null) ? " avec message " + err.message : " sans soucis" );
        });

    });

    socket.on(eventEnum.CreateRoom, function (data) {
       lobby.createRoom(socket, data, function (err) {
           winston.log("Requête " + eventEnum.CreateRoom + " traitté : " + (err != null) ? " avec message " + err.message : " sans soucis" );
       });
    });

    socket.on(eventEnum.JoinRoom , function (data) {
       lobby.joinRoom(socket, data, function (err) {
           winston.log("Requête " + eventEnum.JoinRoom + " traitté : " + (err != null) ? " avec message " + err.message : " sans soucis" );
       });
    });

    socket.on(eventEnum.StartGame , function (data) {
        lobby.startGame(data, function (err) {
            winston.log("Requête " + eventEnum.StartGame + " traitté : " + (err != null) ? " avec message " + err.message : " sans soucis" );
        });
    });

    socket.on(eventEnum.DeleteRoom, function (data) {
        lobby.deleteRoom(data, function (err) {
            winston.log("Requête " + eventEnum.DeleteRoom + " traitté : " + (err != null) ? " avec message " + err.message : " sans soucis" );
        });
    });

});

module.exports = {
    SocketIO : io
};

