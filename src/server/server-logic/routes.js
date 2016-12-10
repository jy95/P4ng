/**
 * Created by jacques on 24-11-16.
 */
let eventEnum = require("../../events.js");
let LobbyGenerator = require("./../game-manager/lobby-manager.js");
let lobby = new LobbyGenerator();
let winston = require("winston");
let mongoDb = require('../database/database-mongodb.js');

// winstom config
winston.remove(winston.transports.Console);
winston.add(
    winston.transports.Console,
    {'timestamp':true , 'colorize' : true}
);

module.exports.winston = winston;

module.exports.gestionSocket = function(socket){

    socket.on(eventEnum.newPlayer, function(data) {
        lobby.newPlayer(socket, data, function (err) {
            winston.log( (err) ? 'warn': 'info', "Request " + eventEnum.newPlayer + " handled : " + ( (err) ? " with message " + err.message : " successfully") );
        });

    });

    socket.on(eventEnum.createRoom, function (data) {
        lobby.createRoom(socket, data, function (err) {
            winston.log( (err) ? 'warn': 'info', "Request " + eventEnum.createRoom + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on(eventEnum.joinRoom , function (data) {
        lobby.joinRoom(socket, data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.joinRoom + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on(eventEnum.startGame , function (data) {
        lobby.startGame(socket,data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.startGame + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on(eventEnum.leaveRoom, function (data) {
        lobby.leaveRoom(socket,data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.leaveRoom + " handled : " + ( (err) ? " with message " + err.message : " successfully" ) );
        });
    });

    socket.on(eventEnum.getAvailableRooms, function () {
        lobby.getAvailableRooms(socket, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.getAvailableRooms + " handled : " + ( (err) ? " with message " + err.message : " successfully" ) );
        });
    });

    // client send its PlayerState to server
    socket.on(eventEnum.playerStateUpdate , function (data) {
        lobby.playerState(socket,data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.playerStateUpdate + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on(eventEnum.endGame , function (data) {
        lobby.endGame(socket,data, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.endGame + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
        });
    });

    socket.on('disconnect', function () {
        lobby.removeDisconnectedPlayers(socket, function (err) {
            winston.log( (err) ? 'warn': 'info' , "Request disconnect handled : " + ( (err) ? " with message " + err.message : " successfully" ));
            socket.disconnect();
        });
    });

    socket.on(eventEnum.signIn, function (data)  {

        mongoDb.checkUserCredentials( { email : data.email , pwd : data.password } , (err, user) =>{

            if(!err){

                function newPlayerWhenSignIn(socket, idDb,data) {

                    // tell the server that SocketID X is player PK Y
                    lobby.registerSocketIdAndId(socket.id,idDb);

                    // register him directly , like normal player
                    lobby.newPlayer(socket, data, function (err) {
                        winston.log( (err) ? 'warn': 'info', "Request " + eventEnum.newPlayer + " with connection handled : " + ( (err) ? " with message " + err.message : " successfully") );
                    });

                }
                // call this function
                newPlayerWhenSignIn(socket,user._id,{name: user.username });

            } else {
                socket.emit(eventsEnum.newPlayer, { id : -1} );
            }

        });
    });


};

module.exports.gameStateUpdate = function (data) {
  lobby.gameStateUpdate(data , function (err) {
      winston.log( (err) ? 'warn': 'info' , "Request " + eventEnum.playerStateUpdate + " handled : " + ( (err) ? " with message " + err.message : " successfully" ));
  });
};

module.exports.getRequiredDataForScore = function (callback) {
    lobby.getRequiredDataForScore( function (data) {
       callback(data);
    });
};

