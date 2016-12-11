var props = require('../../properties-loader.js')
var eventsEnum = require(props.eventsEnumPath())
var lobbyLogic = require(props.lobbyLogicPath())
var lobbyToServer = require(props.lobbyToServerPath())

lobbyLogic.subscribe(addJoinRoomListeners)

document.getElementById('createGame').addEventListener('click', onCreate)
document.getElementById('refreshRooms').addEventListener('click', onRefreshRooms)
document.getElementById('refreshPlayers').addEventListener('click', onRefreshPlayers)

function onCreate(){
    lobbyLogic.createRoom({roomName: document.getElementById('newGameName').value})
}

function makeOnJoinRoom(roomId){
    return function(){
        lobbyLogic.askToJoinRoom({'roomId': roomId})
    }
}

function onRefreshRooms(e){
    lobbyToServer.getAvailableRooms()
}

function onRefreshPlayers(e){
    lobbyToServer.listEnrolledPlayers()
}

function addJoinRoomListeners(){
    let rooms = lobbyLogic.getState().rooms
    for(let i in rooms){
        let roomId = rooms[i].roomId
        document.getElementById(roomId).addEventListener('click', makeOnJoinRoom(roomId))
    }
}
