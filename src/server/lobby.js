
// array who has all the rooms
var rooms = [];
var players = [];

function newPlayer(player,callback) {

    player.id = players.length;
    players[player.id] = player;
    callback(null,player);
}

function listRooms(callback) {
    // à modifier
    callback(null,null);
}

module.exports = {
    newPlayer : newPlayer,
    listRooms : listRooms
};