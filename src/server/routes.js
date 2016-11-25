/**
 * Created by jacques on 24-11-16.
 */
let eventEnum = require("../common/events.js");
let LobbyGenerator = require("./lobby.js");
let lobby = new LobbyGenerator();
let winston = require("winston");

// winstom config
winston.remove(winston.transports.Console);
winston.add(
    winston.transports.Console,
    {'timestamp':true , 'colorize' : true}
);

module.exports.winston = winston;

module.exports.gestionSocket = function(socket, IOsockets){

    socket.on(eventEnum.NewPlayer, function(data) {
        lobby.newPlayer(IOsockets,socket, data, function (err) {
            winston.log( (err) ? 'warn': 'info', "Request " + eventEnum.NewPlayer + " handled : " + ( (err) ? " with message " + err.message : " successfully") );
        });

    });

    socket.on(eventEnum.CreateRoom, function (data) {
        lobby.createRoom(IOsockets,socket, data, function (err) {
            winston.log( (err) ? 'warn': 'info', "Request " + eventEnum.CreateRoom + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on(eventEnum.JoinRoom , function (data) {
        lobby.joinRoom(IOsockets,socket, data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.JoinRoom + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on(eventEnum.StartGame , function (data) {
        lobby.startGame(IOsockets,socket,data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.StartGame + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on(eventEnum.LeaveRoom, function (data) {
        lobby.leaveRoom(IOsockets,socket,data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.LeaveRoom + " handled : " + ( (err) ? " with message " + err.message : " successfully" ) );
        });
    });

    socket.on(eventEnum.GetAvailableRooms, function () {
        lobby.getAvailableRooms(IOsockets,socket, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.GetAvailableRooms + " handled : " + ( (err) ? " with message " + err.message : " successfully" ) );
        });
    });

};
