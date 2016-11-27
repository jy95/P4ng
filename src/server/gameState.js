let eventsEnum = require('../common/events.js');
let emitter = require("./gameEventEmitter.js").commonEmitter;

let Game = function (gameId,fps) {
    this.fps = fps;
    this.delay = 1000 / this.fps;
    this.gameId = gameId;
    this.loopFunction;
    this.onUpdate = function () {
        emitter.emit(eventsEnum.GameState, {gameId : this.gameId , data: tesDonnees} );
        console.log("TEST OK KO");
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

module.exports = Game;
