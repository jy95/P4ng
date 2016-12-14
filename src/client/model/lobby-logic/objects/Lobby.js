
const props = require('../../../../properties-loader.js')
let Room = require('./Room.js')


module.exports = Lobby

function Lobby (){
    // the room we're in: is a Room object
    this.currentRoom = null
    // the available rooms, stored as received from the server
    this.availableRooms = {}
    // the main player on this machine
    this.localPlayer = null
    // the local guests, exists ONLY if we're in a room
    this.localGuestPlayers = {}
    this.localGuestPlayersNumber = 0
    // list of remote players as received from the server, minus the local player
    this.remotePlayers = {}
}

Lobby.prototype.setPlayersList = function(playersList){
    this.remotePlayers = {}
    for(let p of playerList)
    if(p.id !== this.localPlayer.id) remotePlayers[p.id] = p
}

// sets the list of available rooms to the list provided in parameter
Lobby.prototype.setAvailableRooms = function(rooms){
    this.availableRooms = rooms
}

// sets the local player
// can not be reset after that (for now)
// returns true on success, false on failure
Lobby.prototype.setLocalPlayer = function(player){
    if(!this.localPlayer){
        player.isLocal = true
        this.localPlayer = player
        return true
    }
    return false
}

// returns false if there's no local player or if there's already a current room
Lobby.prototype.setCurrentRoom = function(room){
    return (this.isCurrentRoomSettable()? this.doSetCurrentRoom(room) : false)
}

Lobby.prototype.doSetCurrentRoom = function(room){
    // we get the room from the availableRooms list
    if(this.availableRooms){
        for(let i in this.availableRooms){
            let r = this.availableRooms[i]
            if(r.roomId === room.roomId) room = r
        }
    }
    // if it's in there, we pass the players already in the room to the constructor
    this.currentRoom = new Room(room)

    this.currentRoom.addPlayer(this.localPlayer)

    return true
}

// returns true if there's a local player and no current room
// returns false otherwise
Lobby.prototype.isCurrentRoomSettable = function(){
    return this.localPlayer && !this.currentRoom
}

// resets the room properly
Lobby.prototype.resetCurrentRoom = function(){
    // no guests allowed if you're not in a room
    this.localGuestPlayers = {}
    this.localGuestPlayersNumber = 0
    this.currentRoom = null
}

// adds a local guest TO THE LOBBY ONLY
// can be done only if there's a current room
// and not too many guests already
// returns true on success, false otherwise
Lobby.prototype.addGuest = function(player){
    if(!this.canAddGuest()) return false

    player.isLocal = true
    this.localGuestPlayers[player.id] = player
    this.localGuestPlayersNumber++
    return true
}

Lobby.prototype.canAddGuest = function(){
    return this.currentRoom && this.localGuestPlayersNumber < 3
}

// adds a player to the current room
// checks if id belongs to local guest
// in which case player.isLocal is set to true
// returns false if the room can't accept a new player
Lobby.prototype.addPlayerToCurrentRoom = function(player){
    if(this.localGuestPlayers[player.id] || this.localPlayer.id === player.id)
    player.isLocal = true

    return this.currentRoom.addPlayer(player)
}

Lobby.prototype.removePlayer = function(id){
    if(this.currentRoom) this.currentRoom.removePlayer(id)
}

Lobby.prototype.isMaster = function(id){
    return this.currentRoom && this.currentRoom.isMaster(id)
}

Lobby.prototype.toJSON = function(){
    return {
        'rooms': this.availableRooms,
        'currentRoom': this.currentRoom,
        'localPlayer': this.localPlayer,
        'guestPlayers': this.localGuestPlayers,
        'remotePlayers': this.remotePlayers
    }
}
