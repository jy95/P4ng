const EventEmitter = require('events')

let localPlayer = null
let remotePlayers = {}
let currentRoom = null
let rooms = {}
var lobbyEventEmitter = new EventEmitter()

module.exports.setPlayerList = function(playerList){
    remotePlayers = {}
    for(let p of playerList)
        if(!p.id === localPlayer.id) remotePlayers[p.id] = p
}

module.exports.addRemotePlayer = function(player){
    if(player.isLocal)addLocalPlayer(player)
    else remotePlayers[player.id] = player
    lobbyEventEmitter.emit('lobby-update')
}

module.exports.addLocalPlayer = function(player){
    localPlayer = player
    lobbyEventEmitter.emit('lobby-update')
}

module.exports.removePlayer = function({id}){
    if(! id === localPlayer.id) delete remotePlayers[id]
    lobbyEventEmitter.emit('lobby-update')
}

module.exports.addRoom = function(room){
    rooms[room.roomId] = room
    lobbyEventEmitter.emit('lobby-update')
}

module.exports.removeRoom = function({roomId}){
    delete rooms[roomId]
    lobbyEventEmitter.emit('lobby-update')
}

module.exports.getLocalPlayer = function(){
    return localPlayer
}

module.exports.joinRoom = function({roomId}){
    this.currentRoom = rooms[roomId]
}

module.exports.leaveRoom = function({roomId}){
    this.currentRoom = null
}

module.exports.subscribe = function(callback){
    lobbyEventEmitter.on('lobby-update', callback)
}

module.exports.getState = function(){
    return {
        'rooms': rooms,
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
