var eventsEnum = require('../events.js')
var socket = require('../client-socket.js').socket

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
