var eventsEnum = require('../events.js')
var gameLogic = require('../model/game-logic/game-logic.js')
var socket = require('../client-socket.js').socket
var serverToGameEventEmitter = new (require('events'))()


socket.on(eventsEnum.playerStateUpdate, (playerStateArray)=>{
    serverToGameEventEmitter.emit(eventsEnum.playerStateUpdate, playerStateArray)
})
