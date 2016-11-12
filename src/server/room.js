
var game;
var players = new Map();
var creatorId;
var gameId;

var io = require("./server").SocketIO;

function Room(player,gameId,callback) {
    this.creatorId = player;
    this.gameId = gameId;
    callback(null,this);
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

            // TODO add player in var game

            callback(null);
        } else {
            callback(new Error('LIMITE DE JOUEURS ATTEINT'));
        }
    },
    startGame : function (playerId,callback) {
        if (creatorId.id === playerId) {

            // TODO launch game (if not already done)

            callback(null);

        } else {
            callback(new Error("Vous n'êtes pas le propriétaire pour lancer la partie"));
        }
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