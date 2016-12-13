const props = require('../../../properties-loader.js')
const {NORTH, EAST, WEST, SOUTH} = props.gameConsts
const Game = require('./objects/Game.js')

var gameEventEmitter = new (require('events'))()

var currentGame = null
var intervalId = 0

// beginningDirection is used only when joining an existing game
module.exports.initGame = function(id){
    currentGame = new Game(id)
    return currentGame.ball.direction;
}

// subscribe to state update
module.exports.subscribe = function(callback){
    gameEventEmitter.on('gameStateUpdate', function(){
        callback()
    })
}
// this JSON player needs an id and a side
// if he has no side, he is given a remaining side
module.exports.addPlayer = function(player){
    if(currentGame && !currentGame.isFinished){
        currentGame.addPlayer(player)
        console.log(player)
    }
}

module.exports.startGame = function({angle}){
    if(currentGame && !currentGame.isFinished){
        console.log('gameLogic - startGame')
        currentGame.ball.direction = angle
        intervalId = setInterval(function(){
            currentGame.update()
            gameEventEmitter.emit('gameStateUpdate')
        }, 17)
    }
}

module.exports.killGame = function(){
    if(currentGame){
        clearInterval(intervalId)
        delete currentGame.ball.game // I'm afraid of circular references
        currentGame = null
        gameEventEmitter.emit('gameStateUpdate')
    }
}
// returns a JSON with all the data needed to display the game
module.exports.getState = function(){
    return currentGame ? currentGame.toJSON() : null
}

module.exports.updatePlayer = function({id,position}){
    if(currentGame){
        let p = currentGame.players[id]
        if(!p.isLocal){
            p.setPosition(position)
        }
    }
}

module.exports.movePlayerLeft = function({side}){
    if(currentGame)
    currentGame.sides[side].movingLeft()
}

module.exports.movePlayerRight = function({side}){
    if(currentGame)
    currentGame.sides[side].movingRight()
}

module.exports.stopPlayer = function({side}){
    if(currentGame)
    currentGame.sides[side].stop()
}

module.exports.wallPlayer = function({id}){
    currentGame.players[id].wallMe()
}
