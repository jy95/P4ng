//Used to share the client socket among the controllers

const props = require('../../properties-loader.js')
var io = require('socket.io-client')
const eventsEnum = require(props.eventsEnumPath())
var socket = io(props.socketProps.url+":"+props.socketProps.port)
console.log('haha')
socket.on('connect', function(){console.log('success')})
console.log(socket)
module.exports = socket
