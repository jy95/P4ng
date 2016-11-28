//Used to share the client socket among the controllers

var io = require('socket.io-client')
const props = require('../properties-loader.js')
var socket = io.connect(props.socket.url)

module.exports.socket = socket
