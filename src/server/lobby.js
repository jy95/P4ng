
// array who has all the rooms
var rooms = [];
var players = [];

function newPlayer(player,callback) {

    player.id = players.length;
    players[player.id] = player;
    callback(null,player);
}

function listRooms(callback) {
    var result = [];
    rooms.forEach(function (value, index) {
        result[index] = {
            // PROVISOIREMENT COMMENTE -> besoin de Game- Logic ici
            //gameId : value.getGameId(),
            //roomName : value.getName(),
            //status : value.getStatus(),
            //playersCount : value.getPlayersCount()
        }
    });
    callback(null,result);
}

function joinRoom(data,callback) {
    callback(null,null);
}

function deleteRoom(data,callback) {
    callback(null,null);
}

function startGame(data,callback) {
    callback(null,null);
}

module.exports = {
    newPlayer : newPlayer,
    listRooms : listRooms,
    joinRoom : joinRoom,
    startGame : startGame,
    deleteRoom : deleteRoom
};