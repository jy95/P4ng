var props = require('../../properties-loader.js')
var eventsEnum = require(props.eventsEnumPath())
var lobbyLogic = require(props.lobbyLogicPath())
var lobbyToServer = require(props.lobbyToServerPath())

lobbyLogic.subscribe(addJoinRoomListeners)

document.getElementById('createGame').addEventListener('click', onCreate)
document.getElementById('localPlayerName').addEventListener('keypress', onNewPlayer)
document.getElementById('refreshRooms').addEventListener('click', onRefreshRooms)
document.getElementById('refreshPlayers').addEventListener('click', onRefreshPlayers)

function onNewPlayer(e){
    if(e.key === 'Enter'){
        console.log('lobbyController - new player')
        lobbyToServer.newPlayer({name: document.getElementById('localPlayerName').value, id: -1})
        e.preventDefault()
    }
}

function onCreate(){
    lobbyLogic.createRoom({roomName: document.getElementById('newGameName').value})
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
        console.log(rooms[i])
        document.getElementById(rooms[i].roomId).addEventListener('click', function(){lobbyLogic.askToJoinRoom({roomId: rooms[i].roomId})})
    }
}
