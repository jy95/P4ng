const props = require('../../properties-loader.js')

var eventsEnum = require(props.eventsEnumPath())
var socket = require(props.socketPath()).socket

var serverToLobbyEventEmitter = new (require('events'))()

socket.on(eventsEnum.startGame, ({angle})=>{
    serverToLobbyEventEmitter.emit(eventsEnum.startGame, {'angle': angle})
})

socket.on(eventsEnum.gotAvailableRooms, (rooms)=>{
    serverToLobbyEventEmitter.emit(eventsEnum.gotAvailableRooms, rooms)
})

socket.on(eventsEnum.newPlayer, (player)=>{
    serverToLobbyEventEmitter.emit(eventsEnum.newPlayer, player)
})

socket.on(eventsEnum.createRoom, (room)=>{
    serverToLobbyEventEmitter.emit(eventsEnum.createRoom, room)
})

socket.on(eventsEnum.joinRoom, (room)=>{
    serverToLobbyEventEmitter.emit(eventsEnum.joinRoom, room)
})

socket.on(eventsEnum.leaveRoom, ({id, roomId})=>{
    serverToLobbyEventEmitter.emit(eventsEnum.leaveRoom, {'id': id, 'roomId': roomId})
})

socket.on(eventsEnum.gotListEnrolledPlayers, (playersList)=>{
    serverToLobbyEventEmitter.emit(eventsEnum.gotListEnrolledPlayers, playersList)
})

module.exports.on = serverToLobbyEventEmitter.on
