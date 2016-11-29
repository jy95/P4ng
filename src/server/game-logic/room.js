let Game = require('./gameState.js');
let emitter = require('../server-logic/gameEventEmitter.js').commonEmitter;
let eventEnum = require('../../events.js');

function Room(playerId,gameId,roomName) {
    this.creatorId = playerId;
    this.gameId = gameId;
    this.roomName = roomName;
    this.isStarted = false;
    this.isFinished = false;
    this.players= new Map();
    this.game = new Game(this.gameId,60);
    
    // implement the onUpdate function of game
    this.game.onUpdate = function () {

        let playerState = this.game.getPlayerState();

        // envoi de ce playerState à tous les joueurs (event => playerStateUpdate)
        emitter.emit(eventEnum.playerStateUpdate , { gameId : this.gameId , state: playerState} );
    }.bind(this);
}

Room.prototype.addPlayer = function(player,callback) {
    if (this.players.size < 4) {

        // add player in Players Map
        this.players.set(this.players.size, {user: player });

        //add player to game
        this.game.addPlayer(player);

        callback(null);
    } else {
        callback(new Error('MAX LIMIT players reached'));
    }
};

Room.prototype.startGame = function(playerId,callback) {
    if (this.creatorId === playerId.id && !this.isStarted && !this.isFinished) {
        isStarted = true;
        this.game.start();
        callback(null , 0.8);
    } else {
        callback(new Error("You don't have the right to start the game (only master can)"));
    }
};

Room.prototype.leaveRoom = function(player, callback) {

    // find the index of this player in players array
    let index = _findPlayer(player);

    // check index

    switch(index) {
        case -1 :
            callback(new Error("Player not registered in this room"), false, false,false);
            break;

        default :
            // remove player
            this.players.delete(index);

            //remove player from game
            this.game.removePlayer(player);

            // a New Master may be required , if enough players left
            callback(null,  (creatorId === player["id"]) , this.players.size > 1 , this.players.size === 0);
    }


};

Room.prototype.newMaster = function(callback) {

    // first player key
    let firstPlayer = this.players.keys().next().value;

    switch(firstPlayer) {

        case undefined :
            callback(new Error('MAX LIMIT players reached'));
            break;

        default :
            // get his socket
            let userId = (this.players.get(firstPlayer))["user"];

            // set creator
            creatorId =  userId["id"];

            // message for the new player
            let message = {id: this.creatorId, roomId: this.gameId};

            callback(null, userId,message);
    }


};

Room.prototype.listAllPlayer = function(callback) {

    this._allPlayers( function (err,data) {
        callback(err,data);
    })
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

Room.prototype.playerState = function(data, callback){
    this.game.updatePlayers(data);
    callback(null);
};

Room.prototype.endGame = function (data,callback) {

};




module.exports = Room;