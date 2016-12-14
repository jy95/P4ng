const props = require('../../../properties-loader.js')

var eventsEnum = require(props.eventsEnumPath())
var socket = require(props.socketPath())
console.log(socket)
var lobbyLogic = require(props.lobbyLogicPath())
var gameLogic = require(props.gameLogicPath())

socket.on(eventsEnum.gotAvailableRooms, (rooms)=>{
    console.log('serverToLobby - got available rooms')
    lobbyLogic.setRooms(rooms)
})
socket.on(eventsEnum.getAvailableRooms, (rooms)=>{
    console.log('serverToLobby - got available rooms')
    lobbyLogic.setRooms(rooms)
})

socket.on(eventsEnum.newPlayer, (player)=>{
    console.log('serverToLobby - new player')
    lobbyLogic.setLocalPlayer(player)
})

socket.on(eventsEnum.createRoom, (data)=>{
    console.log(`serverToLobby - create room`)
    lobbyLogic.setCurrentRoom(data)
})

socket.on(eventsEnum.joinRoom, (data)=>{
    console.log(`serverToLobby - join room`)
    lobbyLogic.setCurrentRoom(data)
})

socket.on(eventsEnum.leaveRoom, (data)=>{
    console.log('serverToLobby - leave room')
    lobbyLogic.leaveRoom(data)
})

socket.on(eventsEnum.gotListEnrolledPlayers, (playersList)=>{
    console.log('serverToLobby - got list enrolled players')
    lobbyLogic.setPlayerList(playersList)
})
