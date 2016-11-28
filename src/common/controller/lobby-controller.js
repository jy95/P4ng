var props = require('../../properties-loader.js')
var lobbyControllerEventEmitter = new (require('events'))()
var eventsEnum = require(props.eventsEnumPath())

document.getElementById('createGame').addEventListener('click', onCreate)
document.getElementById('localPlayerName').addEventListener('keypress', onNewPlayer)
document.getElementById('refreshRooms').addEventListener('click', onRefreshRooms)
document.getElementById('refreshPlayers').addEventListener('click', onRefreshPlayers)

function onCreate(){
    lobbyControllerEventEmitter.emit(eventsEnum.createRoom, {roomName: document.getElementById('newGameName').value})
}

function onNewPlayer(e){
    if(e.key === 'Enter')
    lobbyControllerEventEmitter.emit(eventsEnum.newPlayer, {name: document.getElementById('newGameName').value, id: -1})
}

function onRefreshRooms(e){
    lobbyControllerEventEmitter.emit(eventsEnum.getAvailableRooms)
}

function onRefreshPlayers(e){
    lobbyControllerEventEmitter.emit(eventsEnum.listEnrolledPlayers)
}

module.exports.on = function(event, callback){
    lobbyControllerEventEmitter.on(event, callback)
}
