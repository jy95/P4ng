
let Game = function (roomId,fps) {
    this.fps = fps;
    this.delay = 1000 / this.fps;
    this.roomId = roomId;
    this.players = {};
    this.loopFunction;
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

Game.prototype.endGame = function (callback) {
    // emettre event quand on a tout recu
    // null si rien
    callback(null);
};

Game.prototype.getPlayerState = function(){
    let playerState = {};
    for(let id in this.players){
        let player = this.players[id].shift();
        if(player !== undefined){
             playerState[id] = player.position;
        }    
    }
    return playerState;

};

module.exports = Game;
