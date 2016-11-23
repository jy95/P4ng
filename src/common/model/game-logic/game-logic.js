const {NORTH, EAST, WEST, SOUTH} = require('./game-const.js')
const Game = require('./objects/Game.js')
const EventEmitter = require('events')

var currentGame = null
var gameEventEmitter = new EventEmitter()
var intervalId = 0

// beginningDirection is used only when joining an existing game
module.exports.initGame = function(beginningDirection){
    currentGame = new Game({ballDirection: beginningDirection, updateCallback: ()=>{
        gameEventEmitter.emit('game-update')
    }})
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
    currentGame.players[id].position = position
}

module.exports.movePlayerLeft = function({id}){
    currentGame.players[id].movingLeft()
}

module.exports.movePlayerRight = function({id}){
    currentGame.players[id].movingRight()
}

module.exports.stopPlayer = function({id}){
    currentGame.players[id].stop()
}

module.exports.ballCorrection = function(paddlePosition, playerId){

    currentGame.ball.move()
}

module.exports.ballCorrection = function(paddlePosition, playerId){

    currentGame.ball.move()
}
