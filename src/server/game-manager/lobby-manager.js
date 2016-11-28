/**
 * Created by jacques on 28-11-16.
 */
let LobbyModule = require("../game-logic/lobby.js");
let eventEnum = require("../../common/events.js");

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

    this.gameLogic.joinRoom(data, (err,json) => {
        if (err) {
            this.socketManager.sendMessage(socket,eventEnum.joinRoom, {id: data["id"], roomId: -1});
            callback(err);
        } else {

            // add the player inside the room ( Socket part )
            this.socketManager.registerNewPlayerInsideARoom(socket, data["roomId"]);

            // notify all the player that new player is registered
            this.socketManager.broadcastMessageInRoom(IOsockets,data["roomId"] ,eventEnum.joinRoom,data);

            // sends to new player an array of players
            this.socketManager.sendMessage(socket, data["roomId"] ,eventEnum.ListEnrolledPlayers,json);

            callback(null);
        }
    });

};

LobbyManager.prototype.newPlayer = function (IOsockets,socket,player,callback) {

    this.gameLogic.newPlayer(player, (err,data) => {
        if (err) {
            callback()
        } else {

            // register in map [UserId ,Socket]
            this.playersToSocket.set(data.id, socket);

            // register in map [SocketId , (Socket , players)]
            if ( this.idToSockets.has(socket.id) ) {

                let newEntry = this.idToSockets.get(socket.id);
                newEntry.players.push(data.id);
                this.idToSockets.set(socket.id , newEntry );

            } else {
                this.idToSockets.set(socket.id , { userSocket : socket , players : [data.id] } );
            }

            // sends json answer
            this.socketManager.sendMessage(socket,eventEnum.newPlayer,data);

            callback(null);
        }
    });

};

LobbyManager.prototype.createRoom = function (IOsockets,socket,data,callback) {

    this.gameLogic.createRoom(data, (err,answer) => {

        if (err) {

            this.socketManager.sendMessage(socket,eventEnum.createRoom, {id: data["id"], roomId: -1});
            callback(err);

        } else {

            // notify the user that he correctly created a room
            this.socketManager.sendMessage(socket,eventEnum.createRoom, answer);

            // add creator in this room player

            this.joinRoom(IOsockets,socket,answer, function (err) {
                callback(err);
            });

        }
    });

};

LobbyManager.prototype.startGame = function (IOsockets,socket,data,callback) {

    this.gameLogic.startGame( data, function (err,answer) {

        if (err) {

            this.socketManager.sendMessage(socket, eventEnum.startGame, {id: data.id, roomId: -1, angle: 0.0} );
            callback(err);

        } else {

            this.socketManager.broadcastMessageInRoom(IOsockets, data["gameId"] ,eventEnum.startGame, {id: data.id, roomId: data.roomId, angle: answer} );
            callback(null);

        }

    });

};

LobbyManager.prototype.leaveRoom = function (IOsockets,socket,data,callback) {

    this.gameLogic.leaveRoom(data, (err, newMasterRequired , hasEnoughPlayers, lastPlayerQuit) => {

        if (err) {

            this.socketManager.sendMessage(socket,eventEnum.leaveRoom , { id: data["id"], roomId: -1 } );
            callback(err);

        } else {


            // A new Master is required
            if ( hasEnoughPlayers && newMasterRequired) {

                this.gameLogic.electNewMaster( data["roomId"] , (err,userId, message) => {
                    if (!err) {
                        let newMasterSocket = this.playersToSocket.get(userId);
                        this.socketManager.sendMessage(newMasterSocket,eventEnum.NewMaster, message);
                    }
                });

            }

            // send data
            this.socketManager.sendMessage(socket,eventEnum.leaveRoom , data);

            // TODO remove inside the two map

            // prevent another players in room
            this.socketManager.broadcastMessageInRoom(IOsockets, data["roomId"] , eventEnum.leaveRoom,  data );

            if ( lastPlayerQuit) {

                // remove room reference
                this.gameLogic.removeRoom(data["roomId"]);

            }

            callback(null);

        }

    });

};

LobbyManager.prototype.getAvailableRooms = function (IOsockets,socket,callback) {

    this.gameLogic.getAvailableRooms( (err,answer) => {

        if (err) {

            callback(err);

        } else {

            // sends data
            this.socketManager.sendMessage(socket,eventEnum.getAvailableRooms, answer);
            callback(null);

        }

    });
};

LobbyManager.prototype.playerState = function (IOsockets,socket,data,callback) {

    this.gameLogic.playerState(data, (err,answer) => {

        // TODO WHAT TO DO HERE
        if (err) {

        } else {

        }

    });

};

LobbyManager.prototype.endGame = function (IOsockets,socket,callback) {

};

LobbyManager.prototype.gameState = function (IOsockets, data, callback) {

};

module.exports = LobbyManager;