var props = require('../../properties-loader.js')
var eventsEnum = require(props.eventsEnumPath())
var socket = require(props.socketPath())
var gameLogic = require(props.gameLogicPath())
var lobbyLogic = require(props.lobbyLogicPath())

socket.on(eventsEnum.playerStateUpdate, (state)=>{
    console.log(state)
    for(let i in state)
    gameLogic.playerStateUpdate(state[i])
})

socket.on(eventsEnum.startGame, ({angle, roomId})=>{
    console.log(`serverToGame - startGame --- ${angle}`)
    if(roomId !== -1) lobbyLogic.startGame({'angle': angle})
})
