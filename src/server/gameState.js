var Game = function (fps) {
    this.fps = fps
    this.delay = 1000 / this.fps
    this.loopFunction
    this.onUpdate = function () {
    };
};

Game.prototype.update = function () {
    this.onUpdate();
};


Game.prototype.loop = function () {
    loopFunction = setTimeout(this.loop.bind(this), this.delay)
    this.update();
};

Game.prototype.start = function () {
    this.loop();
};

Game.prototype.stop = function () {
    clearTimeout(loopFunction);
};

module.exports = Game;
