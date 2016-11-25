var Game = require('./gameState.js')

let isStarted;
let isFinished;
let players;
let creatorId;
let gameId;
let roomName;
let game;

function Room(playerId,gameId,roomName) {
    this.creatorId = playerId;
    this.gameId = gameId;
    this.roomName = roomName;
    this.isStarted = false;
    this.isFinished = false;
    this.players= new Map();
    this.game = new Game(60);
}

Room.prototype.addPlayer = function(socket, player,callback) {
    if (this.players.size < 4) {

        // add player in Players Map
        // I prefer to store the player JSON and its socket - Just in case
        this.players.set(this.players.size, {user: player, socketUser: socket});

        // add user socket to room
        socket.join('Room' + gameId);

        // TODO add player in let game

        callback(null);
    } else {
        callback(new Error('MAX LIMIT players reached'));
    }
};

Room.prototype.startGame = function(playerId,callback) {
    if (this.creatorId === playerId && !this.isStarted && !this.isFinished) {
        isStarted = true;
        callback(null , 0.8);
        this.game.start();
    } else {
        callback(new Error("You don't have the right to start the game (only master can)"));
    }
};

Room.prototype.leaveRoom = function(socket,player, callback) {

    // find the index of this player in players array
    let index = _findPlayer(player);

    // check index
    if ( index === -1 ) {
        callback(new Error("Player not registered in this room"), false, false,false);
    }

    // remove player
    this.players.delete(index);
    socket.leave('Room'+  player["roomId"]);

    // a New Master may be required , if enough players left
    callback(null,  (creatorId === player["id"]) , this.players.size > 1 , this.players.size === 0);

};

Room.prototype.newMaster = function(callback) {

    // first player key
    let firstPlayer = this.players.keys().next().value;

    // get his socket
    let socket = (this.players.get(firstPlayer))["socketUser"];

    // set creator
    creatorId =  (this.players.get(firstPlayer))["id"];

    // message for the new player
    let message = {id: this.creatorId, roomId: this.gameId};

    callback(null, socket,message);

};

Room.prototype.listAllPlayer = function(callback) {

    this._allPlayers( function (err,data) {
        callback(err,data);
    })
};

Room.prototype.sendMessage = function(socket,event,message) {
    socket.emit(event,message);
};

Room.prototype.broadcastMessageInRoomWithoutMe = function(roomId,socket,event,data) {
    socket.broadcast.to('Room'+roomId).emit(event, data);
};

Room.prototype.broadcastMessageInRoom = function(IOsockets,roomId,event,data) {
    IOsockets.in('Room'+roomId).emit(event,data);
};
Room.prototype.broadcastMessageToEveryone = function(IOsockets,event,data) {
    IOsockets.emit(event,data);
};

/**
 * Return index of player
 * @param player
 */
Room.prototype._findPlayer = function(player) {
    let index = -1;
    players.forEach( (value,key) => {
        if (  ( (value.user)["id"] ) === player["id"] ) {
            index = key;
        }
    });
    return index;
};

Room.prototype._allPlayers = function(callback) {
    let playerJson = [];


    this.players.forEach( (value,key) => {
        playerJson.push(
            { playerName: (value.user)["name"],
                playerId : (value.user)["id"] ,
                playerNumber : key
            });
    });
    callback(null, { roomName : this.roomName , roomId : this.gameId , roomPlayers : playerJson } );
};

module.exports = Room;