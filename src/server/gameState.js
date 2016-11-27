let eventsEnum = require('../common/events.js');

let Game = function (gameId,fps) {
    this.fps = fps;
    this.delay = 1000 / this.fps;
    this.gameId = gameId;
    this.loopFunction;
    this.emitter = require("./gameEventEmitter.js").commonEmitter;
    this.onUpdate = function () {
        this.emitter.emit(eventsEnum.gameStateUpdate, {gameId : this.gameId , data: {} } );
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
