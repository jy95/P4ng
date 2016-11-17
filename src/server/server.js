/**
 * Created by jacques on 10-11-16.
 */
let winston = require("winston");
let lobby = require("./lobby.js");
let eventEnum = require("../common/events.js");
let io = require('socket.io')(8080);

io.on("connection", function (socket) {

    socket.on(eventEnum.NewPlayer, function(data) {
        lobby.newPlayer(socket, data, function (err) {
            winston.log("Requête " + eventEnum.newPlayer + " traité : " + (err != null) ? " avec message " + err.message : " sans soucis" );
        });

    });

    socket.on(eventEnum.CreateRoom, function (data) {
       lobby.createRoom(socket, data, function (err) {
           winston.log("Requête " + eventEnum.CreateRoom + " traité : " + (err != null) ? " avec message " + err.message : " sans soucis" );
       });
    });

    socket.on(eventEnum.JoinRoom , function (data) {
       lobby.joinRoom(socket, data, function (err) {
           winston.log("Requête " + eventEnum.JoinRoom + " traité : " + (err != null) ? " avec message " + err.message : " sans soucis" );
       });
    });

    socket.on(eventEnum.StartGame , function (data) {
        lobby.startGame(data, function (err) {
            winston.log("Requête " + eventEnum.StartGame + " traité : " + (err != null) ? " avec message " + err.message : " sans soucis" );
        });
    });

    socket.on(eventEnum.DeleteRoom, function (data) {
        lobby.deleteRoom(data, function (err) {
            winston.log("Requête " + eventEnum.DeleteRoom + " traité : " + (err != null) ? " avec message " + err.message : " sans soucis" );
        });
    });

    socket.on(eventEnum.LeaveRoom, function (data) {
        lobby.leaveRoom(data, function (err) {
            winston.log("Requête " + eventEnum.LeaveRoom + " traité : " + (err != null) ? " avec message " + err.message : " sans soucis" );
        });
    });

});

module.exports = {
    SocketIO : io
};

