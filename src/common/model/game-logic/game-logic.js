const {NORTH, EAST, WEST, SOUTH} = require('./game-const.js')
const Game = require('./objects/Game.js')

var gameEventEmitter = new (require('events'))()

var currentGame = null
var intervalId = 0

// beginningDirection is used only when joining an existing game
module.exports.initGame = function(beginningDirection){
    currentGame = new Game({ballDirection: beginningDirection})
}

// subscribe to state update
module.exports.on = function(callback){
    gameEventEmitter.on('gameStateUpdate', function(){
        callback()
    })
}
// this JSON player needs an id and a side
// if he has no side, he is given a remaining side
module.exports.addPlayer = function(player){
    currentGame.addPlayer(player)
}

module.exports.startGame = function({angle}){
    currentGame.ball.direction = angle
    intervalId = setInterval(function(){
        currentGame.update()
        gameEventEmitter.emit('gameStateUpdate')
    }, 17)
}

module.exports.killGame = function(){
    clearInterval(intervalId)
    delete currentGame.ball.game // I'm afraid of circular references
    currentGame = null
}
// returns a JSON with all the data needed to display the game
module.exports.getState = function(){
    return currentGame.toJSON()
}

module.exports.updatePlayer = function({id,position}){
    let p = currentGame.players[id]
    if(!p.islocal)
        p.position = position
}

module.exports.movePlayerLeft = function({side}){
    currentGame.sides[side].movingLeft()
}

module.exports.movePlayerRight = function({side}){
    currentGame.sides[side].movingRight()
}

module.exports.stopPlayer = function({side}){
    currentGame.sides[side].stop()
}
