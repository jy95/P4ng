const {NORTH, EAST, WEST, SOUTH} = require('game-const.js')
const Game = require('./objects/Game.js')

var currentGame = null

// beginningDirection is used only when joining an existing game
module.exports.initGame = function(beginningDirection){
    currentGame = new Game(beginningDirection)
}

module.exports.startGame = function(){
    currentGame.start()
}

module.exports.killGame = function(){
    delete currentGame.ball.game // I'm afraid of circular references
    clearInterval(currentGame.intervalId)
    currentGame = null
}
// this JSON player needs an id and a side
// if he has no side, he is given a remaining side
module.exports.addPlayer = function(player){
    currentGame.addPlayer(player)
}
// returns a JSON with all the data needed to display the game
module.exports.getState = function(){
    return currentGame.toJSON()
}

module.exports.udpatePlayer = function(id,x,y){
    currentGame.players[id].paddle.x = x
    currentGame.players[id].paddle.x = y
}

module.exports.movePLayerLeft = function(id){
    currentGame.players[id].paddle.movingLeft()
}

module.exports.movePLayerRight = function(id){
    currentGame.players[id].paddle.movingRight()
}

module.exports.stopPlayer = function(id){
    currentGame.players[id].paddle.stop()
}
