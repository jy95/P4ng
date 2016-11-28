var eventsEnum = require('../events.js')
var socket = require('../client-socket.js').socket

var endGameAlreadySent = false


module.exports.sendStateToServer = function(gameState){
    if(!gameState.isFinished){
      socket.emit(eventsEnum.PlayerStateUpdate, getLocalPlayersState(gameState))
    }
    else if (!endGameAlreadySent){
        socket.emit(eventsEnum.EndGame, gameState)
        endGameAlreadySent = true
    }

}

var getLocalPlayersState = function ({players, roomId}){
    var localPlayersState = {}
    localPlayersState.players = {}
    for(key in players){
        var player = players[key]
        if(player.isLocal){
            localPlayersState.players[player.id] = players[key]
        }
    }
    localPlayersState.roomId = roomId
    return localPlayersState
}
