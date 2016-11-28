
var props = require('../../properties-loader.js')
var eventsEnum = require(props.eventsEnumPath())
var socket = require(props.socketPath()).socket
var serverToGameEventEmitter = new (require('events'))()


socket.on(eventsEnum.playerStateUpdate, (playerStateArray)=>{
    serverToGameEventEmitter.emit(eventsEnum.playerStateUpdate, playerStateArray)
})

module.exports.on = serverToGameEventEmitter.on
