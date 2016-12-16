let u = require('underscore');
const props = require('../../properties-loader.js');
const eventEnum = require('../../events.js');

let Game = function (roomId) {
    this.slowpokeDelay = props.gameConsts.slowpokeDelay; 
    this.roomId = roomId;
    this.players = {};
    this.slowpokeTimeout = undefined;
    this.slowpokes = {};
    this.slowpokesLimit = props.gameConsts.slowpokesLimit;
    this.scores = {};
    this.nbEndGameReceived = 0;
    this.playerStateReceived = new Set();
    this.eventEmitter = require("../server-logic/gameEventEmitter.js").commonEmitter;
    this.onUpdate = function () {

    };
};

Game.prototype.update = function () {
     this.onUpdate();   
     this.reduceThePressure(); 
};


Game.prototype.addPlayer = function(player){
    this.players[player.id] = [];
    this.scores[player.id] = [];
    this.slowpokes[player.id] = 0;
};

Game.prototype.removePlayer = function(player){
    delete this.players[player.id];
    delete this.scores[player.id];
    delete this.slowpokes[player.id];
};

Game.prototype.updatePlayers = function(players){
    for(let id in players){
        if (players.hasOwnProperty(id) ) {
            this.players[id].push(players[id]);
            this.playerStateReceived.add(id);
        }
    }
    if(this.receivedAllPlayerStates()){
        clearTimeout(this.slowpokeTimeout);
        this.playerStateReceived.clear();
        this.update();
        let self = this;
        self.slowpokeTimeout = setTimeout(function(){
            self.punishSlowpokes();
            console.log("HERE PUNISH");
        }, this.slowpokeDelay)
    }
};

Game.prototype.endGame = function (players, callback) {
    clearTimeout(this.slowpokeTimeout);
    this.nbEndGameReceived++;
    for(let id in players){
        if (players.hasOwnProperty(id) ) {
            this.scores[id].push(players[id].score);
        }
    }
    callback(this.nbEndGameReceived == Object.keys(this.players).length);
};

Game.prototype.getFinalScores = function(){
    let finalScores = {};
    for(let id in this.scores){
        if (this.scores.hasOwnProperty(id) ) {
            finalScores[id] = u.chain(this.scores[id]).countBy().pairs().max(u.last).head().value();
        }
    }
    return finalScores;
};

Game.prototype.getPlayerState = function(){
    let gameState = {};
    gameState["players"] = {};
    for(let id in this.players) {
        if (this.players.hasOwnProperty(id)) {

            let player = this.players[id].shift();
            if (player !== undefined) {
                gameState["players"][id] = player.position;
            }
        }
    }
    gameState.roomId = this.roomId;
    return gameState;

};

Game.prototype.receivedAllPlayerStates = function(){
    return this.playerStateReceived.size == Object.keys(this.players).length;
};

Game.prototype.punishSlowpokes = function(){
    for(let id in this.players){
        if ( this.players.hasOwnProperty(id)) {
            if (!(this.playerStateReceived.has(id))) {
                this.slowpokes[id]++;
                if (this.slowpokes[id] >= this.slowpokesLimit) {
                    this.eventEmitter.emit(eventEnum.kickSlowpoke, {playerId: id, roomId: this.gameId});
                }
            }
        }
    }
};

Game.prototype.reduceThePressure = function(){
    for(let id in this.players){
        if ( this.players.hasOwnProperty(id)) {
            if (this.slowpokes[id] >= 0.1) {
                this.slowpokes[id] -= 0.1;
            }
        }
    }
};

module.exports = Game;
