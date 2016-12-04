/**
 * Created by jacques on 24-11-16.
 */
let eventEnum = require("../../events.js");
let LobbyGenerator = require("./../game-manager/lobby-manager.js");
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

    socket.on(eventEnum.newPlayer, function(data) {
        lobby.newPlayer(IOsockets,socket, data, function (err) {
            winston.log( (err) ? 'warn': 'info', "Request " + eventEnum.newPlayer + " handled : " + ( (err) ? " with message " + err.message : " successfully") );
        });

    });

    socket.on(eventEnum.createRoom, function (data) {
        lobby.createRoom(IOsockets,socket, data, function (err) {
            winston.log( (err) ? 'warn': 'info', "Request " + eventEnum.createRoom + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on(eventEnum.joinRoom , function (data) {
        lobby.joinRoom(IOsockets,socket, data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.joinRoom + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on(eventEnum.startGame , function (data) {
        lobby.startGame(IOsockets,socket,data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.startGame + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on(eventEnum.leaveRoom, function (data) {
        lobby.leaveRoom(IOsockets,socket,data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.leaveRoom + " handled : " + ( (err) ? " with message " + err.message : " successfully" ) );
        });
    });

    socket.on(eventEnum.getAvailableRooms, function () {
        lobby.getAvailableRooms(IOsockets,socket, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.getAvailableRooms + " handled : " + ( (err) ? " with message " + err.message : " successfully" ) );
        });
    });

    // client send its PlayerState to server
    socket.on(eventEnum.playerStateUpdate , function (data) {
        lobby.playerState(IOsockets,socket,data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.playerStateUpdate + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on(eventEnum.endGame , function (data) {
        lobby.endGame(IOsockets,socket,data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.endGame + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on('disconnect', function () {
        lobby.removeDisconnectedPlayers(IOsockets,socket, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request disconnect handled : " + ( (err) ? " with message " + err.message : " successfully" ));
            socket.disconnect();
        });
    });

};

module.exports.gameStateUpdate = function (data, IOsockets) {
  lobby.gameStateUpdate(IOsockets,data , function (err) {
      winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.gameStateUpdate + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
  });
};
