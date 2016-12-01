//Used to share the client socket among the controllers

const props = require('../properties-loader.js')
var io = require('socket.io-client')
const eventsEnum = require(props.eventsEnumPath())
var lobbyLogic = require(props.lobbyLogicPath())
var socket = io(props.socketProps.url+":"+props.socketProps.port)

socket.on('connect', function(){console.log('success')})

module.exports = socket
