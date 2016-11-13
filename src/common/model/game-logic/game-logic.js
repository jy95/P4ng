const {NORTH, EAST, WEST, SOUTH} = require('./game-const.js')
const Game = require('./objects/Game.js')
const EventEmitter = require('events')

var currentGame = null
var gameEventEmitter = new EventEmitter()
var intervalId

// beginningDirection is used only when joining an existing game
module.exports.initGame = function(beginningDirection){
    currentGame = new Game(beginningDirection, function(){
        this.emit('game-update')
    }.bind(gameEventEmitter))
}

// subscribe to state update
module.exports.subscribe = function(callback){
    gameEventEmitter.on('game-update', function(){
        callback()
    })
}
// this JSON player needs an id and a side
// if he has no side, he is given a remaining side
module.exports.addPlayer = function(player){
    currentGame.addPlayer(player)
}

module.exports.startGame = function(){
    intervalId = setInterval(function(){
        currentGame.update()
    }, 250)
}

module.exports.killGame = function(){
    delete currentGame.ball.game // I'm afraid of circular references
    clearInterval(currentGame.intervalId)
    currentGame = null
}
// returns a JSON with all the data needed to display the game
module.exports.getState = function(){
    return currentGame.toJSON()
}

module.exports.udpatePlayer = function(id,position){
    currentGame.players[id].paddle.position = position
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

module.exports.ballCorrection = function(paddlePosition, playerId){
    
    currentGame.ball.move()
}
