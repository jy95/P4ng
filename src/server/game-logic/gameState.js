
let Game = function (roomId,fps) {
    this.fps = fps;
    this.delay = 1000 / this.fps;
    this.roomId = roomId;
    this.players = {};
    this.loopFunction;
    this.gameEventEmitter = require("../server-logic/gameEventEmitter.js").commonEmitter;
    this.onUpdate = function () {

    };
};

Game.prototype.update = function () {
    this.onUpdate();
};


Game.prototype.loop = function () {
    loopFunction = setTimeout(this.loop.bind(this), this.delay);
    this.update();
};

Game.prototype.start = function () {
    this.loop();
};

Game.prototype.stop = function () {
    clearTimeout(loopFunction);
};

Game.prototype.addPlayer = function(player){
    this.players[player.id] = [];
};

Game.prototype.removePlayer = function(player){
    delete this.players[player.id];
};

Game.prototype.updatePlayers = function({players}){
    for(let id in players){
        this.players[id].push(players[id]);
    }
};

Game.prototype.getPlayerState = function(){
    let playerState = {};
    playerState.roomId = this.roomId;
    playerState.players = {};
    for(let id in this.players){
        playerState.players[id] = this.players[id].shift();
    }
    return playerState;

};

module.exports = Game;
