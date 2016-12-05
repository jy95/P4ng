/**
 * Created by jacques on 28-11-16.
 */
let LobbyModule = require("../game-logic/lobby.js");
let eventEnum = require("../../events.js");

function LobbyManager() {
    // gameLogic Module
    this.gameLogic = new LobbyModule();
    // sockets manager
    this.socketManager = require("../game-manager/socket-manager.js");
    //  Map [Int, List(Int)] - Key : Socket Id , Value : List of players Id
    this.idToSockets = new Map();
    // Map [Int, Socket] - Key : Player Id , Value : Its socket
    this.playersToSocket = new Map();
}

LobbyManager.prototype.joinRoom = function(IOsockets,socket,data,callback) {

    let self = this;

    this.gameLogic.joinRoom(data, function (err,json) {

        switch(err) {

            case null :

                // add the player inside the room ( Socket part )
                self.socketManager.registerNewPlayerInsideARoom(socket, data.roomId);

                // notify all the player that new player is registered
                self.socketManager.broadcastMessageInRoom(IOsockets,data.roomId ,eventEnum.joinRoom,data);

                // sends to new player an array of players
                self.socketManager.sendMessage(socket, data.roomId ,eventEnum.ListEnrolledPlayers,json);

                callback(null);

                break;

            default :
                self.socketManager.sendMessage(socket,eventEnum.joinRoom, {id: data.id, roomId: -1});
                callback(err);
        }

    });

};

LobbyManager.prototype.newPlayer = function (IOsockets,socket,player,callback) {

    let self = this;
    this.gameLogic.newPlayer(player, function (err,data)  {

        switch(err) {
            case null :

                // register in map [UserId ,Socket]
                self.playersToSocket.set(data.id, socket);

                // register in map [SocketId , (Socket , players)]
                if ( self.idToSockets.has(socket.id) ) {

                    let newEntry = self.idToSockets.get(socket.id);
                    newEntry.players.push(data.id);
                    self.idToSockets.set(socket.id , newEntry );

                } else {
                    self.idToSockets.set(socket.id , { userSocket : socket , players : [data.id] } );
                }

                // sends json answer
                self.socketManager.sendMessage(socket,eventEnum.newPlayer,data);

                callback(null);
                break;

            default :
                callback(err);
        }

    });

};

LobbyManager.prototype.createRoom = function (IOsockets,socket,data,callback) {

    let self = this;

    this.gameLogic.createRoom(data, function (err,answer)  {

        switch(err) {
            case null :

                // notify the user that he correctly created a room
                self.socketManager.sendMessage(socket,eventEnum.createRoom, answer);

                // add creator in this room player

                self.joinRoom(IOsockets,socket,answer, function (err) {
                    callback(err);
                });
                break;

            default :

                self.socketManager.sendMessage(socket,eventEnum.createRoom, {id: data.id, roomId: -1});
                callback(err);

        }

    });

};

LobbyManager.prototype.startGame = function (IOsockets,socket,data,callback) {

    let self = this;

    this.gameLogic.startGame( data, function (err,answer) {

        switch(err) {
            case null :

                self.socketManager.broadcastMessageInRoom(IOsockets, data.gameId ,
                    eventEnum.startGame, {id: data.id, roomId: data.roomId, angle: answer} );
                callback(null);
                break;

            default :

                self.socketManager.sendMessage(socket, eventEnum.startGame, {id: data.id, roomId: -1, angle: 0.0} );
                callback(err);
        }

    });

};

LobbyManager.prototype.leaveRoom = function (IOsockets,socket,data,callback) {

    let self = this;

    this.gameLogic.leaveRoom(data, (err, newMasterRequired , hasEnoughPlayers, lastPlayerQuit) => {

        switch(err) {
            case null:

                // A new Master is required
                if ( hasEnoughPlayers && newMasterRequired) {

                    self.gameLogic.electNewMaster( data.roomId , (error,userId, message) => {
                        if (!error) {
                            let newMasterSocket = self.playersToSocket.get(userId);
                            self.socketManager.sendMessage(newMasterSocket,eventEnum.NewMaster, message);
                        }
                    });

                }

                // send data
                self.socketManager.sendMessage(socket,eventEnum.leaveRoom , data);

                // remove player from room , if required :
                if ( ! self.idToSockets.has(socket.id ) ) {
                    self.socketManager.removePlayerFromRoom(socket,data.roomId);
                }

                // prevent another players in room
                self.socketManager.broadcastMessageInRoomWithoutMe(data.roomId , socket, eventEnum.leaveRoom,  data );

                if ( lastPlayerQuit) {

                    // remove room reference
                    self.gameLogic.removeRoom(data.roomId);

                }
                callback(null);
                break;

            default :
                self.socketManager.sendMessage(socket,eventEnum.leaveRoom , { id: data.id, roomId: -1 } );
                callback(err);
        }

    });

};

LobbyManager.prototype.getAvailableRooms = function (IOsockets,socket,callback) {

    let self = this;

    this.gameLogic.getAvailableRooms( function (err,answer) {

        switch(err) {
            case null :

                // sends data
                self.socketManager.sendMessage(socket,eventEnum.getAvailableRooms, answer);
                callback(null);
                break;

            default :
                callback(err);
        }

    });
};

LobbyManager.prototype.playerState = function (IOsockets,socket,data,callback) {

    this.gameLogic.playerState(data, function (err,answer) {

        callback( (err) ? null : err );

    });

};

LobbyManager.prototype.endGame = function (IOsockets,socket,callback) {

};

LobbyManager.prototype.gameStateUpdate = function (IOsockets, data, callback) {
    this.socketManager.broadcastMessageInRoom(IOsockets, data.roomId , eventEnum.playerStateUpdate, data );
    callback(null);
};

LobbyManager.prototype.removeDisconnectedPlayers = function (IOsockets, socket , callback) {

    // get the players Id from socket Id
    let playersStruct = this.idToSockets.get(socket.id);
    let self = this;


    switch(playersStruct) {

        case undefined :
            callback(null);
            break;

        default :

            let players = playersStruct.players;
            // get for each one their room , if they are in
            self.gameLogic.findRoomsOfPlayers(players, function (err,answer) {

                switch(err) {
                    case null :

                        // remove the players that are in a room

                        for ( let [key, value] of answer) {

                            self.leaveRoom(IOsockets,socket, { roomId : value , id : key} , function (anotherErr)  {

                                switch(anotherErr) {

                                    // no problem sir :)
                                    case null :

                                        // remove the coward player id from idToSockets

                                        let previousEntry = self.idToSockets.get(socket.id);
                                        let index = previousEntry.players.indexOf(key);

                                        if (index >= 0) {
                                            previousEntry.players.splice( index, 1 );
                                        }

                                        // set changes
                                        if ( previousEntry.players.length == 0) {
                                            self.idToSockets.delete(socket.id);
                                        } else {
                                            self.idToSockets.set(socket.id , previousEntry );
                                        }

                                        // remove player from lobby players
                                        self.gameLogic.removePlayer(key);
                                        self.playersToSocket.delete(key);

                                        break;

                                    // never expected to got an error but let's handle this case :)
                                    default :
                                        callback(anotherErr);
                                }

                            });
                        }

                        // remove

                        callback(null);
                        break;

                    default :
                        callback(err);
                }
            });
    }

};

module.exports = LobbyManager;
