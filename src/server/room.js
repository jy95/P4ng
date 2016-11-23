
let isStarted;
let players = new Map();
let creatorId;
let gameId;
let roomName;

let io = require("./server").SocketIO;

function Room(playerId,gameId,roomName,callback) {
    this.creatorId = playerId;
    this.gameId = gameId;
    this.roomName = roomName;
    this.isStarted = false;
    callback(null,this);
}

/**
 * Return index of player
 * @param player
 */
function _findPlayer(player) {
    let index = -1;
    players.forEach( (value,key) => {
        if (  ( (value.user)["id"] ) === player["id"] ) {
            index = key;
        }
    });
    return index;
}

module.exports = {
    createRoom : Room,
    addPlayer : function (socket, player,callback) {

        if (players.size < 4) {

            // add player in Players Map
            // I prefer to store the player JSON and its socket - Just in case
            players.add(players.size, {user : player , socketUser : socket} );

            // add user socket to room
            socket.join('Room'+gameId);

            // TODO add player in let game

            callback(null);
        } else {
            callback(new Error('MAX LIMIT players reached'));
        }
    },
    startGame : function (playerId,callback) {
        if (creatorId === playerId && !isStarted) {
            isStarted = true;
            callback(null);

        } else {
            callback(new Error("You don't have the right to start the game (only master can)"));
        }
    },
    leaveRoom : function (socket,player, callback) {

        // find the index of this player in players array
        let index = _findPlayer(player);

        // check index
        if ( index === -1 ) {
            callback(new Error("Player not registered in this room"), false);
        }

        // remove player
        players.delete(index);
        socket.leave('Room'+  player["roomId"]);

        // a New Master may be required , if enough players left
        callback(null,  (creatorId === player["id"]) , players.size !== 1);

    },
    newMaster : function (callback) {

        // first player key
        let firstPlayer = players.keys().next().value;

        // get his socket
        let socket = (players.get(firstPlayer))["socketUser"];

        // set creator
        creatorId =  (players.get(firstPlayer))["id"];

        // message for the new player
        let message = {id: creatorId, roomdId: gameId};

        callback(null, socket,message);

    },
    sendMessage : function (socket,event,message) {
        socket.emit(event,message);
    },
    broadcastMessageInRoomWithoutMe : function (roomId,socket,event,data) {
        socket.broadcast.to('Room'+roomId).emit(event, data);
    },
    broadcastMessageInRoom : function (roomId,event,data) {
        io.sockets.in('Room'+roomId).emit(event,data);
    },
    broadcastMessageToEveryone : function (event,data) {
        io.emit(event,data);
    }
};