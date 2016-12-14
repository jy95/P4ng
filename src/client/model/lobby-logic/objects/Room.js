module.exports = Room

/*
* This object ensures that the players are stored in the correct order
* the algorithm goes as such:
* - when a player joins the room, he is pushed in this.players
* this behavior is always true unless there's 4 players in the room
* at which point nothing happens
*
* - when a player leaves the room before the beginning of the game:
* he's removed from the array and every member after him is moved back
* (2 becomes 1, etc...)
*
* THIS OBJECT DOES NOT CARE FOR LOCAL PLAYERS
* This is the responsibility of the Lobby object
*/

function Room({roomId, roomName, roomPlayers}){
    // the room id
    this.roomId = roomId
    // the players in the room
    this.players = roomPlayers? roomPlayers : []
    for(var i = 0; i< this.players.length; i++){
        if(this.players[i].playerId){
            this.players[i].id = this.players[i].playerId
            this.players[i].name = this.players[i].playerName
        }
    }

    this.roomName = roomName
}

// this methods implements the strategy documented above
Room.prototype.removePlayer = function(playerId){
    for(let i = 0; i<this.players.length; i++)
    if(this.players[i].id === playerId) return this.players.splice(i, 1)
}

// returns false if the player is already in the room or if the room is full
// returns true otherwise
Room.prototype.addPlayer = function(player){
    for(let p in this.players) if(this.players[p].id === player.id) return false
    if(this.players.length >= 4) return false

    this.players.push(player)
    return true
}

Room.prototype.toJSON = function(){
    return {players: this.players, roomId: this.roomId, roomName: this.roomName}
}
