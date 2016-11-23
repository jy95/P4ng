/**
 * Created by jacques on 10-11-16.
 */
let winston = require("winston");
let lobby = require("./lobby.js");
let eventEnum = require("../common/events.js");
let io = require('socket.io')(8080);

// winstom config
winston.remove(winston.transports.Console);
winston.add(
    winston.transports.Console,
    {'timestamp':true , 'colorize' : true}
);

io.on("connection", function (socket) {

    socket.on(eventEnum.NewPlayer, function(data) {
        lobby.newPlayer(socket, data, function (err) {
            winston.log( (err) ? 'warn': 'info', "Request " + eventEnum.NewPlayer + " handled : " + ( (err) ? " with message " + err.message : " successfully") );
        });

    });

    socket.on(eventEnum.CreateRoom, function (data) {
       lobby.createRoom(socket, data, function (err) {
           winston.log( (err) ? 'warn': 'info', "Request " + eventEnum.CreateRoom + " handled : " + (err) ? " with message " + err.message : " successfully" );
       });
    });

    socket.on(eventEnum.JoinRoom , function (data) {
       lobby.joinRoom(socket, data, function (err) {
           winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.JoinRoom + " handled : " + (err) ? " with message " + err.message : " successfully" );
       });
    });

    socket.on(eventEnum.StartGame , function (data) {
        lobby.startGame(data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.StartGame + " handled : " + (err) ? " with message " + err.message : " successfully" );
        });
    });

    socket.on(eventEnum.DeleteRoom, function (data) {
        lobby.deleteRoom(data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.DeleteRoom + " handled : " + (err) ? " with message " + err.message : " successfully" );
        });
    });

    socket.on(eventEnum.LeaveRoom, function (data) {
        lobby.leaveRoom(data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.LeaveRoom + " handled : " + (err) ? " with message " + err.message : " successfully" );
        });
    });

});

module.exports = {
    SocketIO : io
};

