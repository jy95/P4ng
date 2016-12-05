var lobbyEventEmitter = new (require('events'))()
const props = require('../../../properties-loader.js')
const eventsEnum = require(props.eventsEnumPath())
var lobbyToServer = require(props.lobbyToServerPath())
var gameLogic = require(props.gameLogicPath())

let localPlayer = null
let remotePlayers = {}
let currentRoom = null
let rooms = {}

module.exports.setPlayerList = function(playerList){
    remotePlayers = {}
    for(let p of playerList)
    if(!p.id === localPlayer.id) remotePlayers[p.id] = p
}

module.exports.setLocalPlayer = function(player){
    localPlayer = player
    localPlayer.isLocal = true
    lobbyEventEmitter.emit('lobbyUpdate')
}

module.exports.getLocalPlayer = function(){
    return localPlayer
}

module.exports.removePlayer = function({id}){
    if(! id === localPlayer.id) delete remotePlayers[id]
    lobbyEventEmitter.emit('lobbyUpdate')
}

module.exports.createRoom = function({roomName}){
    if(localPlayer && roomName && !currentRoom){
        lobbyToServer.createRoom({
            'id': localPlayer.id,
            'roomName': roomName
        })
        return 'request sent';
    }
    return localPlayer ? 'You need a room name!' : 'You need to create a player!'
}

module.exports.joinRoom = function({roomId}){
    if(localPlayer && roomId)
    lobbyToServer.joinRoom({
        'id': localPlayer.id,
        'roomId': roomId
    })
}

module.exports.leaveRoom = function({roomId, id}){
    if(!roomId && currentRoom){
        lobbyToServer.leaveRoom(currentRoom)
        currentRoom = null
        gameLogic.killGame()
    }else if(currentRoom && roomId === currentRoom.roomId){
        if(id === localPlayer.id){
            currentRoom = null
            gameLogic.killGame()
        }else{
            currentRoom.removePlayer(id)
        }
    }
    lobbyEventEmitter.emit('lobbyUpdate')
    console.log('lobbyLogic - leave room')
}

module.exports.setCurrentRoom = function(room){
    currentRoom = room
    currentRoom.angle = gameLogic.initGame()
    gameLogic.addPlayer(localPlayer)
    lobbyEventEmitter.emit('lobbyUpdate')
}

module.exports.setRooms = function(roomsList){
    rooms = roomsList
    lobbyEventEmitter.emit('lobbyUpdate')
}

module.exports.subscribe = function(callback){
    lobbyEventEmitter.on('lobbyUpdate', callback)
}

module.exports.getState = function(){
    return {
        'rooms': rooms,
        'currentRoom': currentRoom,
        'localPlayer': localPlayer,
        'remotePlayers': remotePlayers//getRankedPlayersList()
    }
}

module.exports.startGame = function(){
    if(currentRoom){
        lobbyToServer.startGame({angle: currentRoom.angle, roomId: currentRoom.roomId, id: localPlayer.id})
        console.log(`lobbyLogic - startGame ${currentRoom.angle}`)
    }
}

// returns an array of players ordered by their total score
function getRankedPlayersList(){
    if(remotePlayers){
        let playersArray = remotePlayers.sort(function(a,b){
            return a.rank - b.rank
        })
    }
}
