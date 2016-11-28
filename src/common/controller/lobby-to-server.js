var props = require('../../properties-loader.js')
var eventsEnum = require(props.eventsEnumPath())
var socket = require(props.socketPath()).socket

module.exports.createRoom = function({id, roomName}){
    socket.emit(eventsEnum.createRoom, {'id': id, 'roomName': roomName})
}

module.exports.joinRoom = function({id, roomId}){
    if(roomId && id)
    socket.emit(eventsEnum.joinRoom, {'id': id, 'roomId': roomId})
}

module.exports.leaveRoom = function({id, roomId}){
    if(roomId && id)
    socket.emit(eventsEnum.leaveRoom, {'id': id, 'roomId': roomId})
}

module.exports.startGame = function({id, roomId, angle}){
    if(roomId && id && angle !== undefined && angle !== null)
    socket.emit(eventsEnum.leaveRoom, {'id': id, 'roomId': roomId, 'angle': angle})
}

module.exports.newPlayer = function({name}){
    if(name)
    socket.emit(eventsEnum.newPlayer, {'name': name})
}
