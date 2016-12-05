const props = require('../../properties-loader.js')

var eventsEnum = require(props.eventsEnumPath())
var socket = require(props.socketPath())
var lobbyLogic = require(props.lobbyLogicPath())
var gameLogic = require(props.gameLogicPath())

socket.on(eventsEnum.gotAvailableRooms, (rooms)=>{
    lobbyLogic.setRooms(rooms)
    console.log('serverToLobby - got available rooms')
})
socket.on(eventsEnum.getAvailableRooms, (rooms)=>{
    lobbyLogic.setRooms(rooms)
    console.log('serverToLobby - got available rooms')
})

socket.on(eventsEnum.newPlayer, (player)=>{
    lobbyLogic.setLocalPlayer(player)
    console.log('serverToLobby - new player')
})

socket.on(eventsEnum.createRoom, (room)=>{
    lobbyLogic.setCurrentRoom(room)
    console.log('serverToLobby - create room')
})

socket.on(eventsEnum.joinRoom, (room)=>{
    lobbyLogic.setCurrentRoom(room)
    console.log('serverToLobby - join room')
})

socket.on(eventsEnum.leaveRoom, ({id, roomId})=>{
    lobbyLogic.leaveRoom({})
    console.log('serverToLobby - leave room')
})

socket.on(eventsEnum.gotListEnrolledPlayers, (playersList)=>{
    lobbyLogic.setPlayerList(playersList)
    console.log('serverToLobby - got list enrolled players')
})
