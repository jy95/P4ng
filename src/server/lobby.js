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
    let room = this.rooms.get( data["roomdId"] );


    if (currentPlayer == null) {
        primaryRoom.sendMessage(socket,eventEnum.JoinRoom, {id: data["id"], roomId: -1});
        callback(new Error("No user found"));
    } else if (room == null) {
        primaryRoom.sendMessage(socket,eventEnum.JoinRoom, {id: data["id"], roomId: -1});
        callback(new Error("Room doesn't exist"));
    } else {
        room.addPlayer(socket,currentPlayer, function (err) {
            if (err) {

                // error message
                primaryRoom.sendMessage(socket,eventEnum.JoinRoom, {id: data["id"], roomId: -1});
                callback(err);

            } else {

                // notify other players this new player
                room.listAllPlayer(function (err,json) {

                    // notify all the player that new player is registered
                    primaryRoom.broadcastMessageInRoom(IOsockets,data["roomdId"] ,eventEnum.JoinRoom,data);

                    // sends to new player an array of players
                    primaryRoom.sendMessage(socket, data["roomdId"] ,eventEnum.ListEnrolledPlayers,json);

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
    primaryRoom.sendMessage(socket,eventEnum.NewPlayer,player);
    callback(null);
};

Lobby.prototype.createRoom = function (IOsockets,socket,data,callback) {
    // get player data
    let currentPlayer = this.players.get( data["id"]);

    if (currentPlayer == null) {
        primaryRoom.sendMessage(socket,eventEnum.CreateRoom, {id: data["id"], roomId: -1});
        callback(new Error("No user found"));
    } else {

        let roomId = uuid.v1();

        let room = new RoomModule( data["id"], roomId , data["roomName"]);


        // add the created room to other
        this.rooms.set(room.gameId, room);

        // json Data
        data["roomdId"] = room.gameId;

        primaryRoom.sendMessage(socket,eventEnum.CreateRoom, data);

        // add creator in this room player
        this.joinRoom(IOsockets,socket,data, function (err,data) {
            callback(err);
        });

    }

};

Lobby.prototype.startGame = function (IOsockets,socket,data,callback) {
    // get player and room data
    let currentPlayer = this.players.get( data["id"]);
    let room = this.rooms.get( data["roomdId"] );

    if (currentPlayer == null) {
        callback(new Error("No user found"));
    } else if (room == null) {
        callback(new Error("Room doesn't exist "));
    } else {
        room.startGame(currentPlayer, function (err) {
            if (err) {
                callback(err);
            } else {
                // TODO What to send When game started ?
                primaryRoom.broadcastMessageInRoom(IOsockets, data["gameId"] ,eventEnum.StartGame,{})
            }
        });
    }

};

Lobby.prototype.leaveRoom = function (IOsockets,socket,data,callback) {
    // get player and room data
    let currentPlayer = this.players.get( data["id"]);
    let room = this.rooms.get( data["roomdId"] );

    if (currentPlayer == null) {
        primaryRoom.sendMessage(socket,eventEnum.LeaveRoom , { id: data["id"], roomId: -1 } );
        callback(new Error("No user found"));
    } else if (room == null) {
        primaryRoom.sendMessage(socket,eventEnum.LeaveRoom , { id: data["id"], roomId: -1 } );
        callback(new Error("Room doesn't exist "));
    } else {
        room.leaveRoom(socket, currentPlayer , function (err, newMasterRequired , hasEnoughPlayers, lastPlayerQuit ) {
            if (err) {
                primaryRoom.sendMessage(socket,eventEnum.LeaveRoom , { id: data["id"], roomId: -1 } );
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
                primaryRoom.sendMessage(socket,eventEnum.LeaveRoom , data);
                // prevent another players in room
                primaryRoom.broadcastMessageInRoom(IOsockets, data["roomdId"] , eventEnum.LeaveRoom,  data );

                if ( lastPlayerQuit) {
                    // remove room reference
                    this.rooms.delete( data["roomdId"] );
                }

            }
        });
    }
};


module.exports = Lobby;
