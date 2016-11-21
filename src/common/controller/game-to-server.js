var eventsEnum = require('../events.js')
var gameLogic = require('../model/game-logic/game-logic.js')
var socket = require('../client-socket.js').socket


gameLogic.subscribe(() => {
    socket.emit(eventsEnum.PlayerState, gameLogic.getState)
})



//called by main
module.exports.initGameToServer = function(confObj){

}