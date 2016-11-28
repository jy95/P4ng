
const props = require('./properties-loader.js')

var eventsEnum = require(props.eventsEnumPath())

var gameLogic = require(props.gameLogicPath())
var gameController = null
var gameView = null

var lobbyLogic = require(props.lobbyLogicPath())
var lobbyController = null
var lobbyView = null

var lobbyToServer = require(props.lobbyToServerPath())
var serverToLobby = require(props.serverToLobbyPath())

var gameToServer = require(props.gameToServerPath())
var serverToGame = require(props.serverToGamePath())


module.exports = function(){
    gameController = require(props.gameControllerPath())
    gameView = require(props.gameViewPath())

    lobbyController = require(props.lobbyControllerPath())
    lobbyView = require(props.lobbyViewPath())


    // set lobby-controller listeners
    lobbyController.on(eventsEnum.createRoom, (data)=>{
        lobbyLogic.createRoom(data)
    })
    lobbyController.on(eventsEnum.newPlayer, (data)=>{
        lobbyToServer.newPlayer(data)
    })
    lobbyController.on(eventsEnum.getAvailableRooms, ()=>{
        lobbyToServer.getAvailableRooms()
    })
    lobbyController.on(eventsEnum.listEnrolledPlayers, ()=>{
        lobbyToServer.listEnrolledPlayers()
    })
    lobbyController.on(eventsEnum.joinRoom, ({room})=>{
        lobbyLogic.joinRoom({room})
    })

    // set game-controller listeners
    gameController.on('moveLeft', (side)=>{
        gameLogic.movePlayerLeft(side)
    })
    gameController.on('moveRight', (side)=>{
        gameLogic.movePlayerRight(side)
    })
    gameController.on('stop', (side)=>{
        gameLogic.stopPlayer(side)
    })
    gameController.on('start', ()=>{
        lobbyToServer.startGame()
    })

    // set server-to-lobby listeners
    serverToLobby.on(eventsEnum.startGame, (data)=>{
        gameLogic.startGame(data)
    })
    serverToLobby.on(eventsEnum.gotAvailableRooms, (rooms)=>{
        lobbyLogic.setRooms(rooms)
    })
    serverToLobby.on(eventsEnum.newPlayer, (player)=>{
        lobbyLogic.setLocalPlayer(player)
    })
    serverToLobby.on(eventsEnum.createRoom, (room)=>{
        lobbyLogic.setCurrentRoom(room)
    })
    serverToLobby.on(eventsEnum.joinRoom, (player)=>{
        gameLogic.addPlayer(player)
    })
    serverToLobby.on(eventsEnum.leaveRoom, (room)=>{
        lobbyLogic.leaveRoom(room)
    })

    // set server-to-game listener
    serverToGame.on(eventsEnum.playerStateUpdate, (playerArray)=>{
        for(let p in playerArray)
            gameLogic.updatePlayer(p)
    })

    // set game-logic listeners
    gameLogic.on(eventsEnum.gameStateUpdate, ()=>{
        gameView.update(gameLogic.getState())
        gameToServer.sendStateToServer(gameLogic.getState())
    })

    // set lobby-logic listeners
    lobbyLogic.on('lobbyUpdate', ()=>{
        lobbyView.update(lobbyLogic.getState())
    })
}
