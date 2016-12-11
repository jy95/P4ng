let u = require('underscore');
const props = require('../../properties-loader.js');

let Game = function (roomId) {
    this.fps = props.fps;
    this.delay = 1000 / this.fps;
    this.roomId = roomId;
    this.players = {};
    this.loopFunction;
    this.scores = {};
    this.nbEndGameReceived = 0;
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
    this.scores[player.id] = [];
};

Game.prototype.removePlayer = function(player){
    delete this.players[player.id];
    delete this.scores[player.id];
};

Game.prototype.updatePlayers = function(players){
    for(let id in players){
        this.players[id].push(players[id]);
    }
};

Game.prototype.endGame = function (players, callback) {
    this.nbEndGameReceived++;
    for(let id in players){
        this.scores[id].push(players[id].score);
    }
    callback(this.nbEndGameReceived == Object.keys(this.players).length);
};

Game.prototype.getFinalScores = function(){
    var finalScores = {};
    for(let id in this.scores){
        finalScores[id] = u.chain(this.scores[id]).countBy().pairs().max(u.last).head().value();
    }
    return finalScores;
};

Game.prototype.getPlayerState = function(){
    let playerState = {};
    for(let id in this.players){
        console.log(id);
        let player = this.players[id].shift();
        if(player !== undefined){
             playerState[id] = player.position;
        }    
    }
    return playerState;

};

module.exports = Game;
