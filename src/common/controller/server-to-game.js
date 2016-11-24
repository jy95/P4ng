var eventsEnum = require('../events.js')
var gameLogic = require('../model/game-logic/game-logic.js')
var socket = require('../client-socket.js').socket


socket.on(eventsEnum.GameState, function(data){
    for(key in data.players){
        gameLogic.updatePlayer(data.players[key])
    }
})