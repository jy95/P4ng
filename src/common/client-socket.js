//Used to share the client socket among the controllers

var io = require('socket.io-client')
var socket

//called by main
module.exports.initClientSocket = function(confObj){
    socket = io.connect(confObj.url)
}

module.exports.socket = socket