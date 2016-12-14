const props = require('../../../properties-loader.js')
var eventsEnum = require(props.eventsEnumPath())
var socket = require(props.socketPath())
var gameLogic = require(props.gameLogicPath())
var endGameAlreadySent = false

gameLogic.subscribe(()=>{sendStateToServer()})

function sendStateToServer (){
    let state = getLocalPlayersState()
    if(state){
        if(!state.isFinished){
            socket.emit(eventsEnum.playerStateUpdate, state)
            endGameAlreadySent = false
        }
        else if (!endGameAlreadySent){
            for(let p in state.players)
            socket.emit(eventsEnum.endGame, state)

            endGameAlreadySent = true
        }
    }
}

function getLocalPlayersState (){
    var localPlayersState = {}
    localPlayersState.players = {}
    let state = gameLogic.getState()
    if(state){
        for(let p in state.players){
            if(state.players[p].isLocal)
            localPlayersState.players[p] = state.players[p]
        }

        localPlayersState.roomId = state.roomId
        localPlayersState.isFinished = state.isFinished
    }
    return localPlayersState
}
