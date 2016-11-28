const props = require('../../properties-loader.js')
var eventsEnum = require(props.eventsEnumPath())
var socket = require(props.socketPath()).socket

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
