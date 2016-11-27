let RoomModule = require("./room.js");
let eventEnum = require("../common/events.js");
let uuid = require('uuid');

// all the rooms
let rooms;

// all players
let players;

// default room
let primaryRoom;

function Lobby() {
    this.rooms  = new Map();
    this.players = new Map();
    primaryRoom = new RoomModule();
}

Lobby.prototype.joinRoom = function(IOsockets,socket,data,callback) {

    // get player and room data
    let currentPlayer = this.players.get( data["id"] );
    let room = this.rooms.get( data["roomId"] );


    if (currentPlayer == null) {
        primaryRoom.sendMessage(socket,eventEnum.joinRoom, {id: data["id"], roomId: -1});
        callback(new Error("No user found"));
    } else if (room == null) {
        primaryRoom.sendMessage(socket,eventEnum.joinRoom, {id: data["id"], roomId: -1});
        callback(new Error("Room doesn't exist"));
    } else {
        room.addPlayer(socket,currentPlayer, function (err) {
            if (err) {

                // error message
                primaryRoom.sendMessage(socket,eventEnum.joinRoom, {id: data["id"], roomId: -1});
                callback(err);

            } else {

                // notify other players this new player
                room.listAllPlayer(function (err,json) {

                    // notify all the player that new player is registered
                    primaryRoom.broadcastMessageInRoom(IOsockets,data["roomId"] ,eventEnum.joinRoom,data);

                    // sends to new player an array of players
                    primaryRoom.sendMessage(socket, data["roomId"] ,eventEnum.ListEnrolledPlayers,json);

                    callback(null);

                });

            }
        });
    }
};

Lobby.prototype.newPlayer = function (IOsockets,socket,player,callback) {

    // create a id for this player
    player.id = uuid.v1();

    // add player Json to Players
    this.players.set(player.id, player);

    // send data
    primaryRoom.sendMessage(socket,eventEnum.newPlayer,player);
    callback(null);
};

Lobby.prototype.createRoom = function (IOsockets,socket,data,callback) {
    // get player data
    let currentPlayer = this.players.get( data["id"]);

    if (currentPlayer == null) {
        primaryRoom.sendMessage(socket,eventEnum.createRoom, {id: data["id"], roomId: -1});
        callback(new Error("No user found"));
    } else {

        let roomId = uuid.v1();

        let room = new RoomModule( data["id"], roomId , data["roomName"]);


        // add the created room to other
        this.rooms.set(room.gameId, room);

        // json Data
        data["roomId"] = room.gameId;

        primaryRoom.sendMessage(socket,eventEnum.createRoom, data);

        // add creator in this room player
        this.joinRoom(IOsockets,socket,data, function (err,data) {
            callback(err);
        });

    }

};

Lobby.prototype.startGame = function (IOsockets,socket,data,callback) {
    // get player and room data
    let currentPlayer = this.players.get( data["id"]);
    let room = this.rooms.get( data["roomId"] );

    if (currentPlayer == null) {
        primaryRoom.sendMessage(socket, eventEnum.startGame, {id: data.id, roomId: -1, angle: 0.0} );
        callback(new Error("No user found"));
    } else if (room == null) {
        primaryRoom.sendMessage(socket, eventEnum.startGame, {id: data.id, roomId: -1, angle: 0.0} );
        callback(new Error("Room doesn't exist "));
    } else {
        room.startGame(currentPlayer, function (err,angle) {
            if (err) {
                callback(err);
            } else {
                // notify game start
                primaryRoom.broadcastMessageInRoom(IOsockets, data["gameId"] ,eventEnum.startGame, {id: data.id, roomId: data.roomId, angle: angle} );
                callback(null);
            }
        });
    }

};

Lobby.prototype.leaveRoom = function (IOsockets,socket,data,callback) {
    // get player and room data
    let currentPlayer = this.players.get( data["id"]);

    let room = this.rooms.get( data["roomId"] );

    if (currentPlayer == null) {
        primaryRoom.sendMessage(socket,eventEnum.leaveRoom , { id: data["id"], roomId: -1 } );
        callback(new Error("No user found"));
    } else if (room == null) {
        primaryRoom.sendMessage(socket,eventEnum.leaveRoom , { id: data["id"], roomId: -1 } );
        callback(new Error("Room doesn't exist "));
    } else {
        room.leaveRoom(socket, currentPlayer , function (err, newMasterRequired , hasEnoughPlayers, lastPlayerQuit ) {
            if (err) {
                primaryRoom.sendMessage(socket,eventEnum.leaveRoom , { id: data["id"], roomId: -1 } );
                callback(err);
            } else {

                // remove player from lobby players
                this.players.delete( data["id"] );

                // A new Master is required
                if ( hasEnoughPlayers && newMasterRequired) {
                    room.newMaster( function (err, newMasterSocket, message) {
                        // never failed (theoretically spoken)
                        if (!err) {
                            primaryRoom.sendMessage(newMasterSocket,eventEnum.NewMaster, message);
                        }
                    });
                }

                // send data
                primaryRoom.sendMessage(socket,eventEnum.leaveRoom , data);
                // prevent another players in room
                primaryRoom.broadcastMessageInRoom(IOsockets, data["roomId"] , eventEnum.leaveRoom,  data );

                if ( lastPlayerQuit) {
                    // remove room reference
                    this.rooms.delete( data["roomId"] );
                }

            }
        });
    }
};

Lobby.prototype.getAvailableRooms = function (IOsockets,socket,callback) {

    // json array for all rooms
    let Roomsjson = [];

    // iteration
    this.rooms.forEach( (value,key) => {

        // Json for a single room
        let Roomjson = {};

        value._allPlayers( function (err,data) {
            Roomjson = data;
            Roomsjson.push(Roomjson);
        });

    });

    // sends data
    primaryRoom.sendMessage(socket,eventEnum.getAvailableRooms, Roomsjson);

    callback(null);
};

Lobby.prototype.playerState = function (IOsockets,socket,callback) {

    let room = this.rooms.get( data["roomId"] );

    if (room == null) {
        callback(new Error("Room doesn't exist"));
    } else {

        room.playerState(data, function (callback) {
            // si message à envoyer
        });
        callback(null);
    }

};

Lobby.prototype.endGame = function (IOsockets,socket,callback) {

    let room = this.rooms.get( data["roomId"] );

    if (room == null) {
        callback(new Error("Room doesn't exist"));
    } else {

        room.endGame(data, function (callback) {
            // si message à envoyer
        });
        callback(null);
    }

};

Lobby.prototype.gameState = function (IOsockets, data, callback) {

    let room = this.rooms.get( data["gameId"] );

    if (room == null) {
        callback(new Error("Room doesn't exist"));
    } else {

        room.broadcastMessageInRoom(IOsockets, data["gameId"], eventEnum.GameState , data );
        callback(null);
    }
};

module.exports = Lobby;
