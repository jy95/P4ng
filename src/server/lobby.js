let roomModule = require("./room.js");
let eventEnum = require("../common/events.js");

// all the rooms
let rooms  = new Map();
// all players
let players = new Map();

module.exports = {
    newPlayer : function (socket,player,callback) {

        // create a id for this player
        player.id = generateId();

        // add player Json to Players
        players.set(player.id, player);

        // send data
        roomModule.sendMessage(socket,eventEnum.NewPlayer,player);
        callback(null);
    },
    createRoom : function (socket,data,callback) {
        // get player data
        let currentPlayer = players.get( parseInt(data["id"] , 10));

        if (currentPlayer == null) {
            callback(new Error("No user found"));
        } else {

        roomModule.createRoom(parseInt(data["id"] , 10), generateId , data["roomName"], function (err,room) {

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
        let currentPlayer = players.get( parseInt(data["id"], 10) );
        let room = rooms.get( parseInt(data["roomdId"] , 10) );


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
                    roomModule.broadcastMessageInRoom(parseInt(data["roomdId"] , 10),eventEnum.JoinRoom,data);
                    callback(null);
                }
            });
        }
    },
    startGame : function (socket,data,callback) {
        // get player and room data
        let currentPlayer = players.get( parseInt(data["id"] , 10));
        let room = rooms.get( parseInt( data["roomdId"] , 10) );

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
                   roomModule.broadcastMessageInRoom( parseInt( data["gameId"] , 10),eventEnum.StartGame,{})
               }
            });
        }

    },
    leaveRoom: function (socket,data,callback) {
        // get player and room data
        let currentPlayer = players.get( parseInt(data["id"] , 10));
        let room = rooms.get( parseInt( data["roomdId"] , 10) );

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
                   players.delete( parseInt(data["id"] , 10) );

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
                   roomModule.broadcastMessageInRoom( parseInt( data["roomdId"] , 10) , eventEnum.LeaveRoom,  data );

               }
            });
        }
    }
};

// generateId Functions

function generateId() {
    let ts = new Date().toString();
    let parts = ts.split( "" ).reverse();
    let id = "";

    for( let i = 0; i < this.length; ++i ) {
        let index = _getRandomInt( 0, parts.length - 1 );
        id += parts[index];
    }

    return id;
}

function _getRandomInt( min, max ) {
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}