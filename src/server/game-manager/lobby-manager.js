/**
 * Created by jacques on 28-11-16.
 */
let LobbyModule = require("../game-logic/lobby.js");
let eventEnum = require("../../events.js");

function LobbyManager() {
    // gameLogic Module
    this.gameLogic = new LobbyModule();
    // sockets manager
    this.socketManager = require("./socket-manager.js");
    //  Map [Int, List(Int)] - Key : Socket Id , Value : List of players Id
    this.idToSockets = new Map();
    // Map [Int, Socket] - Key : Player Id , Value : Its socket
    this.playersToSocket = new Map();
    // Map [Int, Int] : SocketId , IdDb
    this.socketIdtoIdDb = new Map();
}

LobbyManager.prototype.joinRoom = function(socket,data,callback) {

    let self = this;

    self.gameLogic.joinRoom(data, function (err,json) {

        switch(err) {

            case null :

                // notify all the player that new player is registered
                self.socketsInsideARoom(data.roomId , function (sockets) {
                    self.socketManager.broadcastMessageInRoom(sockets ,eventEnum.joinRoom,data);
                });

                // sends to new player an array of players
                self.socketManager.sendMessage(socket, data.roomId ,eventEnum.listEnrolledPlayers,json);

                callback(null);

                break;

            default :
                self.socketManager.sendMessage(socket,eventEnum.joinRoom, {id: data.id, roomId: -1});
                callback(err);
        }

    });

};

LobbyManager.prototype.newPlayer = function (socket,player,callback) {

    let self = this;
    self.gameLogic.newPlayer(player, function (err,data)  {

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

LobbyManager.prototype.createRoom = function (socket,data,callback) {

    let self = this;

    this.gameLogic.createRoom(data, function (err,answer)  {

        switch(err) {
            case null :

                // notify the user that he correctly created a room
                self.socketManager.sendMessage(socket,eventEnum.createRoom, answer);

                // add creator in this room player

                self.joinRoom(socket,answer, function (err) {
                    callback(err);
                });
                break;

            default :

                self.socketManager.sendMessage(socket,eventEnum.createRoom, {id: data.id, roomId: -1});
                callback(err);

        }

    });

};

LobbyManager.prototype.startGame = function (socket,data,callback) {

    let self = this;

    self.gameLogic.startGame( data, function (err,answer) {

        switch(err) {
            case null :

                self.socketsInsideARoom(data.roomId , function (sockets) {
                    self.socketManager.broadcastMessageInRoom(sockets, eventEnum.startGame,
                        {id: data.id, roomId: data.roomId, angle: answer} );
                });
                callback(null);
                break;

            default :

                self.socketManager.sendMessage(socket, eventEnum.startGame, {id: data.id, roomId: -1, angle: 0.0} );
                callback(err);
        }

    });

};

LobbyManager.prototype.leaveRoom = function (socket,data,callback) {

    let self = this;

    self.gameLogic.leaveRoom(data, (err, newMasterRequired , hasEnoughPlayers, lastPlayerQuit) => {

        switch(err) {
            case null:

                /* FOR FUTURE RELEASE : Change the master of the room
                // A new Master is required
                if ( hasEnoughPlayers && newMasterRequired) {

                    self.gameLogic.electNewMaster( data.roomId , (error,userId, message) => {
                        if (!error) {
                            let newMasterSocket = self.playersToSocket.get(userId);
                            self.socketManager.sendMessage(newMasterSocket,eventEnum.newMaster, message);
                        }
                    });

                }
                */

                if (newMasterRequired) {
                    // CURRENT RELEASE : DELETE ROOM
                    self.socketsInsideARoom(data.roomId, function (sockets) {

                        self.gameLogic.listAllPlayer(data.roomId, function (err,answer) {
                            if (!err) {

                                // tell each players that they are ejected (fired)

                                for (let player in answer.roomPlayers ) {
                                    self.socketManager.broadcastMessageInRoom(sockets , eventEnum.leaveRoom,  { id : answer.roomPlayers[player].playerId} );
                                }

                            }
                        });

                        // remove room reference
                        self.gameLogic.removeRoom(data.roomId);
                    });

                } else {

                    // send data +  prevent another players in room
                    self.socketsInsideARoom(data.roomId, function (sockets) {
                        self.socketManager.broadcastMessageInRoom(sockets , eventEnum.leaveRoom,  data );
                    });

                    // remove socket from room , if required :
                    if ( self.idToSockets.has(socket.id ) ) {

                        // removes player ID from idToSockets

                        let previousEntry = self.idToSockets.get(socket.id);
                        let index = previousEntry.players.indexOf(data.id);

                        if (index >= 0) {
                            previousEntry.players.splice( index, 1 );
                        }

                        // set changes
                        if ( previousEntry.players.length == 0) {
                            self.idToSockets.delete(socket.id);
                        } else {
                            self.idToSockets.set(socket.id , previousEntry );
                        }

                    }

                    if ( lastPlayerQuit) {

                        // remove room reference
                        self.gameLogic.removeRoom(data.roomId);

                    }
                }
                callback(null);
                break;

            default :
                self.socketManager.sendMessage(socket,eventEnum.leaveRoom , { id: data.id, roomId: -1 } );
                callback(err);
        }

    });

};

LobbyManager.prototype.getAvailableRooms = function (socket,callback) {

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

LobbyManager.prototype.playerState = function (socket,data,callback) {

    this.gameLogic.playerState(data, function (err,answer) {

        callback( (err) ? null : err );

    });

};

LobbyManager.prototype.endGame = function (socket,data,callback) {
    this.gameLogic.endGame(data, function (err) {
        callback(err ? err : null);
    });
};

LobbyManager.prototype.gameStateUpdate = function (data, callback) {

    let self = this;

    this.socketsInsideARoom(data.roomId , function (sockets) {
        self.socketManager.broadcastMessageInRoom(sockets, eventEnum.playerStateUpdate, data );
        callback(null);
    });
};

LobbyManager.prototype.removeDisconnectedPlayers = function ( socket , callback) {

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

                            self.leaveRoom(socket, { roomId : value , id : key} , function (anotherErr)  {

                                switch(anotherErr) {

                                    // no problem sir :)
                                    case null :

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

                        // remove connection from this player account
                        self.socketIdtoIdDb.delete(socket.id);

                        callback(null);
                        break;

                    default :
                        callback(err);
                }
            });
    }

};

LobbyManager.prototype.registerSocketIdAndId = function (socketId, idDb) {
    this.socketIdtoIdDb.set(socketId,idDb);
};

LobbyManager.prototype.getRequiredDataForScore = function (callback) {

    callback({ playersToSocket : this.playersToSocket , idToSockets : this.idToSockets , socketIdtoIdDb : this.socketIdtoIdDb });
};

LobbyManager.prototype.socketsInsideARoom = function (roomId, callback) {

    let self = this;
    let room = self.gameLogic.getRoom(roomId);

    if ( room === undefined) {
        callback([]);
    } else {

    let alreadyVisitedSockets = new Set();
    let playersSockets = [];


    room.listAllPlayer( function (err,data) {
        // neverExpected to be here
        if (!err) {

            // get playersId
            data.roomPlayers.forEach( function(playerIndex) {

                // get sockets from players Id
                let key = self.playersToSocket.get(playerIndex.playerId);

                if ( ! alreadyVisitedSockets.has(key)) {
                    playersSockets.push(key);
                    alreadyVisitedSockets.add(key);
                }

            });

            callback(playersSockets);
        }
        });
    }
};

LobbyManager.prototype.kickSlowpoke = function (playerId,roomId, callback) {
    let socket = this.idToSockets.get(playerId);
    this.leaveRoom(socket, {id: playerId, roomId: roomId} , function (err) {
        callback(err);
    });
};

module.exports = LobbyManager;
