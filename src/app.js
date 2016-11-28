const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const properties = require('./properties-loader.js')

var eventsEnum = require(props.eventsEnum)
// can't require views and controllers as long as the document isn't loaded
var gameLogic = require(props.gameLogic)
var gameController = null
var gameView = null

var lobbyLogic = require(props.lobbyLogic)
var lobbyController = null
var lobbyView = null

var lobbyToServer = require(props.lobbyToServer)
var serverToLobby = require(props.serverToLobby)

var gameToServer = require(props.gameToServer)
var serverToGame = require(props.serverToGame)


// Global ref to window to avoid garbage collection
let win

function createWindow(){
    win = new BrowserWindow({width: 700, height: 700, icon: path.resolve(`${__dirname}/../ressources/P4ng_logo_1.png`)})
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'common/view/html/index.html'),
        protocol: 'file:',
        slashes: true
    }))

    win.once('ready-to-show', ()=>{
        init()
    })

    win.on('closed', ()=>{
        app.quit()
    })
}


function init(){

    gameController = require('./common/controller/game-controller.js')
    gameView = require('./common/view/js/game-view.js')

    lobbyController = require('./common/controller/lobby-controller.js')
    lobbyView = require('./common/view/js/lobby-view.js')


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
        gameLogic.start()
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
    serverToLobby.on(eventsEnum.joinRoom, (room)=>{
        lobbyLogic.joinRoom(room)
    })
    serverToLobby.on(eventsEnum.leaveRoom, (room)=>{
        lobbyLogic.leaveRoom(room)
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

app.on('ready', ()=>{
    createWindow()
})
