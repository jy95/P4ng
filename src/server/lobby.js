let roomModule = require("./room.js");
let eventEnum = require("../common/events.js");
let uuid = require('node-uuid');

// all the rooms
let rooms  = new Map();
// all players
let players = new Map();

module.exports = {
    newPlayer : function (socket,player,callback) {

        // create a id for this player
        player.id = uuid.v1();

        // add player Json to Players
        players.set(player.id, player);

        // send data
        roomModule.sendMessage(socket,eventEnum.NewPlayer,player);
        callback(null);
    },
    createRoom : function (socket,data,callback) {
        // get player data
        let currentPlayer = players.get( data["id"]);

        if (currentPlayer == null) {
            callback(new Error("No user found"));
        } else {

        let roomId = uuid.v1();

        roomModule.createRoom( data["id"], roomId , data["roomName"], function (err,room) {

            // add creator in this room player
            room.addPlayer(socket, currentPlayer, function (err) {
                if (err) {
                    callback(err);
                } else {

                    // add the created room to other
                    rooms.set(room.gameId, room);

                    // json Data
                    data["roomdId"] = room.gameId;

                    // send data
                    roomModule.sendMessage(socket,eventEnum.CreateRoom, data);
                    callback(null);
                }
            });

        });

        }
    },
    joinRoom : function (socket,data,callback) {
        // get player and room data
        let currentPlayer = players.get( data["id"] );
        let room = rooms.get( data["roomdId"] );


        if (currentPlayer == null) {
            callback(new Error("No user found"));
        } else if (room == null) {
            callback(new Error("Room doesn't exist "));
        } else {
            room.addPlayer(socket,currentPlayer, function (err) {
                if (err) {
                    callback(err);
                } else {

                    // send data to everyone
                    roomModule.broadcastMessageInRoom( data["roomdId"] ,eventEnum.JoinRoom,data);
                    callback(null);
                }
            });
        }
    },
    startGame : function (socket,data,callback) {
        // get player and room data
        let currentPlayer = players.get( data["id"]);
        let room = rooms.get( data["roomdId"] );

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
                   roomModule.broadcastMessageInRoom( data["gameId"] ,eventEnum.StartGame,{})
               }
            });
        }

    },
    leaveRoom: function (socket,data,callback) {
        // get player and room data
        let currentPlayer = players.get( data["id"]);
        let room = rooms.get( data["roomdId"] );

        if (currentPlayer == null) {
            callback(new Error("No user found"));
        } else if (room == null) {
            callback(new Error("Room doesn't exist "));
        } else {
            room.leaveRoom(socket, currentPlayer , function (err, newMasterRequired , hasEnoughPlayers ) {
               if (err) {
                   callback(err);
               } else {

                   // remove player from lobby players
                   players.delete( data["id"] );

                   // A new Master is required
                   if ( hasEnoughPlayers && newMasterRequired) {
                        room.newMaster( function (err, newMasterSocket, message) {
                            if (err) {
                                callback(err);
                            } else {
                                roomModule.sendMessage(newMasterSocket,eventEnum.NewMaster, message);
                            }
                        });
                   }

                   // send data
                   roomModule.sendMessage(socket,eventEnum.LeaveRoom , data);
                   // prevent another players in room
                   roomModule.broadcastMessageInRoom( data["roomdId"] , eventEnum.LeaveRoom,  data );

               }
            });
        }
    }
};
