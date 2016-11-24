var eventsEnum = require('../events.js')
var gameLogic = require('../model/game-logic/game-logic.js')
var socket = require('../client-socket.js').socket
var endGameAlreadySent = false


gameLogic.subscribe(() => {
    var gameState = gameLogic.getState()
    if(!gameState.isFinished){
      socket.emit(eventsEnum.PlayerState, getLocalPlayersState(gameState))  
    }
    else if (!endGameAlreadySent){
        socket.emit(eventsEnum.EndGame, gameState)
        endGameAlreadySent = true
    }
    
})

var getLocalPlayersState = function ({players, roomId}){
    var localPlayersState = {}
    localPlayersState.players = {}
    var index = 1
    for(key in players){
        if(players[key].isLocal){
            localPlayersState.players[index++] = players[key]
        }
    }
    localPlayersState.roomId = roomId
    return localPlayersState
}