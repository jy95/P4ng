var roomModule = require("./room.js");
var eventEnum = require("../common/events.js");

// all the rooms
var rooms  = new Map();
// all players
var players = new Map();

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
        var currentPlayer = players.get(data["id"]);

        if (currentPlayer == null) {
            callback(new Error("PAS D'ID User pour créer une ROOM"));
        } else {

        roomModule.createRoom(currentPlayer, generateId , function (err,room) {

            // add creator in this room player
            room.addPlayer(socket, currentPlayer, function (err) {
                if (err) {
                    callback(err);
                } else {

                    // add the created room to other
                    rooms.set(room.gameId, room);

                    // send data
                    roomModule.sendMessage(socket,eventEnum.CreateRoom, data);
                    callback(null);
                }
            });

        });

        }
    },
    joinRoom : function (socket,data,callback) {
        var currentPlayer = players.get(data["id"]);
        var room = rooms.get(data["gameId"]);

        if (currentPlayer == null) {
            callback(new Error("PAS D'ID User pour rejoindre une ROOM"));
        } else if (room == null) {
            callback(new Error("cette ROOM n'existe pas"));
        } else {
            room.addPlayer(socket,currentPlayer, function (err) {
                if (err) {
                    callback(err);
                } else {

                    // send data
                    roomModule.sendMessage(socket,eventEnum.JoinRoom, data);

                    callback(null);
                }
            });
        }
    },
    startGame : function (socket,data,callback) {
        var currentPlayer = players.get(data["id"]);
        var room = rooms.get(data["gameId"]);

        if (currentPlayer == null) {
            callback(new Error("PAS D'ID User pour rejoindre une ROOM"));
        } else if (room == null) {
            callback(new Error("cette ROOM n'existe pas"));
        } else {
            room.startGame(currentPlayer, function (err) {
               if (err) {
                   callback(err);
               } else {
                   // TODO What to send When game started ?
                   roomModule.broadcastMessageInRoom(data["gameId"],eventEnum.StartGame,{})
               }
            });
        }

    }
    // See next time for these cases :
    //deleteRoom : deleteRoom
    // removePlayer
};

// generateId Functions

function generateId() {
    var ts = new Date().toString();
    var parts = ts.split( "" ).reverse();
    var id = "";

    for( var i = 0; i < this.length; ++i ) {
        var index = getRandomInt( 0, parts.length - 1 );
        id += parts[index];
    }

    return id;
}

function getRandomInt( min, max ) {
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}