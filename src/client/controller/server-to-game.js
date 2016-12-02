var props = require('../../properties-loader.js')
var eventsEnum = require(props.eventsEnumPath())
var socket = require(props.socketPath())
var gameLogic = require(props.gameLogicPath())

console.log('serverToGame required')

socket.on(eventsEnum.playerStateUpdate, (playerStateArray)=>{
    console.log('playerStateUpdate')
    for(let p of playerStateArray)
    gameLogic.playerStateUpdate(p)
})
