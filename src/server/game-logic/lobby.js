let RoomModule = require("./room.js");
let uuid = require('uuid');

function Lobby() {
    // all the rooms
    this.rooms  = new Map();
    // all players
    this.players = new Map();
    // default room
    //this.primaryRoom = new RoomModule();
}

Lobby.prototype.joinRoom = function(data,callback) {

    // get player and room data
    let currentPlayer = this.players.get( data.id );
    let room = this.rooms.get( data.roomId );

    if (currentPlayer === undefined) {
        callback(new Error("No user found"));
    } else if (room === undefined) {
        callback(new Error("Room doesn't exist"));
    } else {

        // add the player inside the room
        room.addPlayer(currentPlayer, function (err) {

            if (err) {

                callback(err);

            } else {

                // get the json of player
                room.listAllPlayer(function (err,json) {

                    callback(err,json);

                });

            }
        });
    }
};

Lobby.prototype.listAllPlayer = function (roomId, callback) {
    let room = this.rooms.get( roomId );

    if (room === undefined) {
        callback(new Error("Room doesn't exist"));
    } else {
        // get the json of player
        room.listAllPlayer(function (err,json) {

            callback(err,json);

        });
    }

};

Lobby.prototype.newPlayer = function (player,callback) {

    // create a id for this player
    player.id = uuid.v1();

    // add player Json to Players
    this.players.set(player.id, player);

    callback(null, player);
};

Lobby.prototype.removePlayer = function (playerId) {
    // remove player from lobby players
    this.players.delete( playerId );
};

Lobby.prototype.createRoom = function (data,callback) {
    // get player data
    let currentPlayer = this.players.get( data.id);

    if (currentPlayer === undefined) {
        callback(new Error("No user found"));
    } else {

        // get a id
        let roomId = uuid.v1();

        // create a new Room with this id
        let room = new RoomModule( data.id, roomId , data.roomName);

        // add the created room to other
        this.rooms.set(room.gameId, room);

        // json Data
        data.roomId = room.gameId;
        callback(null, data);
    }

};

Lobby.prototype.startGame = function (data,callback) {
    // get player and room data
    let currentPlayer = this.players.get( data.id);
    let room = this.rooms.get( data.roomId );

    if (currentPlayer === undefined) {
        callback(new Error("No user found"));
    } else if (room === undefined) {
        callback(new Error("Room doesn't exist "));
    } else {
        room.startGame(currentPlayer, function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null,data.angle);
            }

        });
    }

};

Lobby.prototype.leaveRoom = function (data,callback) {
    // get player and room data
    let currentPlayer = this.players.get( data.id);
    let room = this.rooms.get( data.roomId );

    if (currentPlayer === undefined) {

        callback(new Error("No user found"));

    } else if (room === undefined) {

        callback(new Error("Room doesn't exist "));

    } else {
        room.leaveRoom(currentPlayer , function (err, newMasterRequired , hasEnoughPlayers, lastPlayerQuit )  {

            if (err) {

                callback(err);

            } else {

                callback(null, newMasterRequired , hasEnoughPlayers, lastPlayerQuit);

            }
        });
    }
};

Lobby.prototype.getAvailableRooms = function (callback) {

    // json array for all rooms
    let Roomsjson = [];

    // iteration
    this.rooms.forEach( (value,key) => {
        if (value.canBeListed() ) {
            // Json for a single room
            let Roomjson = {};

            value._allPlayers( function (err,data) {
                Roomjson = data;
                Roomsjson.push(Roomjson);
            });
        }
    });

    callback(null,Roomsjson);
};

Lobby.prototype.playerState = function (data,callback) {

    let room = this.rooms.get( data.roomId );

    if (room === undefined) {
        callback(new Error("Room doesn't exist"));
    } else {

        room.playerState(data.players, function (err) {
            callback(err ? err : null);
        });

    }

};

Lobby.prototype.endGame = function (data,callback) {

    let room = this.rooms.get( data.roomId );

    if (room === undefined) {
        callback(new Error("Room doesn't exist"));
    } else {

        room.endGame(data, function (err) {
            callback(err ? err : null);
        });

    }

};
/* FOR FUTURE RELEASE
Lobby.prototype.electNewMaster = function (roomId, callback) {
    let room = this.rooms.get(roomId);

    if (room === undefined) {
        callback(new Error("Room doesn't exist"));
    } else {
        room.newMaster( (err,userId, message) => {
            callback(err,userId, message);
        });
    }

};
*/
Lobby.prototype.findRoomsOfPlayers = function (players, callback) {
    let search = new Map();

    // iterate in all rooms
    for (let [key, room] of this.rooms) {

        // for each player
        for ( let aPlayer of players) {

            // if this user exists in this room
            if ( room.findPlayer( {id : aPlayer}) != -1 ) {
                search.set(aPlayer, key);
            }
        }
    }
    callback(null,search);
};

Lobby.prototype.removeRoom = function (roomId) {
    // stop the game if still running
    this.rooms.get(roomId).stopGame();
    this.rooms.delete( roomId );
};

Lobby.prototype.getRoom = function (roomId) {
    return this.rooms.get(roomId);
};

module.exports = Lobby;
