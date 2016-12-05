var props = require('../../properties-loader.js')
var eventsEnum = require(props.eventsEnumPath())
var socket = require(props.socketPath())
var gameLogic = require(props.gameLogicPath())

console.log('serverToGame required')

socket.on(eventsEnum.playerStateUpdate, (state)=>{
    console.log(state)
    //console.log('playerStateUpdate')
    for(let p of playerStateArray)
    gameLogic.playerStateUpdate(p)
})

socket.on(eventsEnum.startGame, ({angle, roomId})=>{
    console.log(`serverToGame - startGame --- ${angle}`)
    if(roomId !== -1) gameLogic.startGame({'angle': angle})
})
