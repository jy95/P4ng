var props = require('../../properties-loader.js')
var eventsEnum = require(props.eventsEnumPath())
var socket = require(props.socketPath()).socket
var gameLogic = require(props.gameLogicPath()).socket


socket.on(eventsEnum.playerStateUpdate, (playerStateArray)=>{
    for(let p of playerStateArray)
    gameLogic.playerStateUpdate(p)
})