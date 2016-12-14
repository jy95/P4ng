var lobbyEventEmitter = new (require('events'))()
const props = require('../../../properties-loader.js')
const eventsEnum = require(props.eventsEnumPath())
var lobbyToServer = require(props.lobbyToServerPath())
var gameLogic = require(props.gameLogicPath())
console.log('ll loaded')
const gameController = require(props.gameControllerPath())
const Lobby = require('./objects/Lobby.js')

let theLobby = new Lobby()

module.exports.setPlayerList = function(playerList){
    console.log('lobby logic - set player list')
    theLobby.setPlayerList(playerList)
}

// if the local player isn't set yet, this method sets him
// if he's set, then it tries to add a guest
// if it manages to add a guest, it asks the server to make the guest join the current room
// then it emits an update
module.exports.setLocalPlayer = function(player) {
    console.log('lobby logic - set local player')
    if (!theLobby.setLocalPlayer(player) && theLobby.addGuest(player))
    lobbyToServer.joinRoom({roomId: theLobby.currentRoom.roomId, id: player.id, name: player.name})

    lobbyEventEmitter.emit('lobbyUpdate')
}

module.exports.newPlayer = function({name}){
    console.log('lobby logic - new player')
    if(!name && (theLobby.localPlayer || !theLobby.canAddGuest())) return false

    lobbyToServer.newPlayer({'name': name})
    return true
}

// asks the server to create a room
module.exports.createRoom = function({roomName}){
    console.log('lobby logic - create room')
    if(theLobby.isCurrentRoomSettable() && roomName){
        lobbyToServer.createRoom({
            'id': theLobby.localPlayer.id,
            'roomName': roomName
        })
    }
}

// asks the server to join a room
module.exports.askToJoinRoom = function({roomId}){
    console.log('lobby logic - ask to join')
    if(theLobby.isCurrentRoomSettable() && roomId){
        lobbyToServer.joinRoom({
            'id': theLobby.localPlayer.id,
            'roomId': roomId,
            'name': theLobby.localPlayer.name
        })
    }
}

// leaves a room, warns the server if necessary
module.exports.leaveRoom = function({roomId, id}){
    console.log('lobby logic - leave room')
    // if the player is the main local player and we haven't left yet
    if(id === theLobby.localPlayer.id && theLobby.currentRoom){
        nukeRoom()
    }else{ // else juste remove the player
        theLobby.currentRoom.removePlayer(id)
        gameLogic.wallPlayer({'id': id})
    }
    // warn the server if order comes from local
    if(!roomId && theLobby.currentRoom)

    // tell listeners
    lobbyEventEmitter.emit('lobbyUpdate')
}

module.exports.askToLeaveRoom = function(){
    lobbyToServer.leaveRoom({roomId: theLobby.currentRoom.roomId, id:theLobby.localPlayer.id})
    nukeRoom()
    lobbyEventEmitter.emit('lobbyUpdate')
}

function nukeRoom(){
    gameLogic.killGame()
    theLobby.resetCurrentRoom()
}

module.exports.setCurrentRoom = function(data){
    console.log('lobby logic - set current room')
    if(!theLobby.setCurrentRoom(data))
    theLobby.addPlayerToCurrentRoom({id: data.id, name: data.name})

    lobbyEventEmitter.emit('lobbyUpdate')
}

module.exports.setRooms = function(roomsList){
    console.log('lobby logic - set rooms')
    theLobby.setAvailableRooms(roomsList)
    lobbyEventEmitter.emit('lobbyUpdate')
}


// asks the server to start a game
module.exports.askToStartGame = function(){
    console.log('lobby logic - ask to start game')
    if(theLobby.currentRoom){
        let theAngle = gameLogic.initGame(theLobby.currentRoom.roomid)
        lobbyToServer.startGame({angle: theAngle, roomId: theLobby.currentRoom.roomId, id: theLobby.localPlayer.id})
        console.log(`lobbyLogic - askToStartGame --- ${theAngle}`)
    }
}

// actually starts a game
module.exports.startGame = function({angle}) {
    console.log('lobby logic - start game')
    let theRoom = theLobby.currentRoom
    if(theRoom) {
        gameLogic.initGame(theLobby.currentRoom.roomId)
        for (let i = 0; i< theRoom.players.length; i++) { //add players to the Game instance
            gameLogic.addPlayer(theRoom.players[i])
            //this is ideally where the game-controller should be asked to assign a
            //controller device to the players
            gameController.assignController(gameController.GAMEPAD, i)
        }
        gameLogic.startGame({'angle': angle})
    }
}

module.exports.subscribe = function(callback){
    lobbyEventEmitter.on('lobbyUpdate', callback)
}

module.exports.getState = function(){
    return theLobby.toJSON()
}

// returns an array of players ordered by their total score
function getRankedPlayersList(){
    if(remotePlayers){
        let playersArray = remotePlayers.sort(function(a,b){
            return a.rank - b.rank
        })
    }
}
