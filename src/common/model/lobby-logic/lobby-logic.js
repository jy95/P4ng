var lobbyEventEmitter = new (require('events'))()
const props = require('../../../properties-loader.js')
var eventsEnum = require(props.eventsEnumPath())

let localPlayer = null
let remotePlayers = {}
let currentRoom = null
let rooms = {}

module.exports.setPlayerList = function(playerList){
    remotePlayers = {}
    for(let p of playerList)
    if(!p.id === localPlayer.id) remotePlayers[p.id] = p
}

module.exports.addRemotePlayer = function(player){
    if(player.isLocal)addLocalPlayer(player)
    else remotePlayers[player.id] = player
    lobbyEventEmitter.emit('lobbyUpdate')
}

module.exports.setLocalPlayer = function(player){
    localPlayer = player
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
    if(localPlayer && roomName){
        lobbyEventEmitter.emit(eventsEnum.createRoom, {
            'id': localPlayer.id,
            'roomName': roomName
        })
    }
}

module.exports.addRoom = function(room){
    rooms[room.roomId] = room
    lobbyEventEmitter.emit('lobbyUpdate')
}

module.exports.removeRoom = function({roomId}){
    delete rooms[roomId]
    lobbyEventEmitter.emit('lobbyUpdate')
}

module.exports.joinRoom = function({roomId}){
    if(currentplayer && roomId)
    lobbyEventEmitter.emit(eventsEnum.joinRoom, {
        'id': currentPlayer.id,
        'roomId': roomid
    })
}

module.exports.leaveRoom = function({roomId, id}){
    if(roomId === currentRoom.roomId){
        if(id === localPlayer.id) currentRoom = null
        else currentRoom.removePlayer(id)
        lobbyEventEmitter.emit('lobbyUpdate')
    }
}

module.exports.setCurrentRoom = function(room){
    currentRoom = room
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
        'remotePlayers': getRankedPlayersList()
    }
}

// returns an array of players ordered by their total score
function getRankedPlayersList(){
    let playersArray = remotePlayers.values().sort(function(a,b){
        return a.rank - b.rank
    })
}
