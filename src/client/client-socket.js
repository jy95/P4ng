//Used to share the client socket among the controllers

const props = require('../properties-loader.js')
var io = require('socket.io-client')
const eventsEnum = require(props.eventsEnumPath())
var lobbyLogic = require(props.lobbyLogicPath())
var socket = io(props.socketProps.url+":"+props.socketProps.port)

socket.on('connect', function(){console.log('success')})
socket.on(eventsEnum.startGame, ({angle})=>{
    serverToLobbyEventEmitter.emit(eventsEnum.startGame, {'angle': angle})
})

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

socket.on(eventsEnum.leaveRoom, (room)=>{
    lobbyLogic.leaveRoom(room)
    console.log('serverToLobby - leave room')
})

socket.on(eventsEnum.gotListEnrolledPlayers, (playersList)=>{
    lobbyLogic.setPlayerList(playersList)
    console.log('serverToLobby - got list enrolled players')
})

module.exports.on = function(event, callback){
    socket.on(event, callback)
}
module.exports.emit = function(event, data){
    socket.emit(event, data)
}
