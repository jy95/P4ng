const props = require('../../properties-loader.js')
var eventsEnum = require(props.eventsEnumPath())
var socket = require(props.socketPath())
var gameLogic = require(props.gameLogicPath())
var endGameAlreadySent = false
console.log('game to server required')

gameLogic.subscribe(()=>{sendStateToServer()})

function sendStateToServer (){
    let state = getLocalPlayersState()
    if(!state.isFinished){
      socket.emit(eventsEnum.playerStateUpdate, state)
      endGameAlreadySent = false
    }
    else if (!endGameAlreadySent){
        socket.emit(eventsEnum.EndGame, state)
        endGameAlreadySent = true
    }

}

function getLocalPlayersState (){
    var localPlayersState = {}
    localPlayersState.players = {}
    let state = gameLogic.getState()
    for(let p in state.players){
        if(state.players[p].isLocal)
            localPlayersState.players[p] = state.players[p]
    }
    localPlayersState.roomId = state.roomId
    localPlayersState.isFinished = state.isFinished
    return localPlayersState
}
