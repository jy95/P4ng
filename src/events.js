/*
    Pseudo enum listing all the events used within the p4ng app for the communications between the clients and the server
*/

module.exports = {
    /*
        When a new player is connected, after having chosen a name, the client sends {name: "Jacques"}
        The server registers the new player, gives him and ID and puts him in the main lobby
        The server sends back {name: "Jacques", id: 47}
        This event is also used for multiple players on the same client
    */
    newPlayer : "newPlayer",

    /*
        Whenever needed (player has just connected, returns to the main lobby after a game is finished...) the server will send a client
        a list of all the available rooms, i.e., the rooms where the maximum number of players isn't reached and for which the game hasn't started yet
        The JSON will look like an array of this
        {
            roomId: 47,
            roomName: 'Chill game cyka blyat',
            players: array of player JSON
        }

        TO DISCUSS : to not overload the traffic, we perhaps shouldn't send the info that a new game is created to all players in the main lobby
        to keep their view up-to-date, but just send the list at key moments as mentioned above and add a refresh button in the client.
        The room may contain a lot of other attributes, like a difficulty (casu, hardcore), a password, a max number of player etc that will be clarified
        later in the development.

    */
    getAvailableRooms : "getAvailableRooms",


    /*
        Event fired when the client lobby updates its available rooms list after a GetAvailableRooms
    */
    gotAvailableRooms : "gotAvailableRooms",

    /*
        When a player wants to create a room, he specifies a name. Other attributes may be added in the future
        The client sends {id: 47, roomName: 'pong fever'}
        If the player isn't in a room yet, he will be moved from the main lobby to his newly created room
        The server sends {roomId: 47, roomName: 'pong fever'}
        If not, the server sends back the same JSON (may change if not clear enough)

    */
    createRoom : "createRoom",

    /*
        When a player wants to join a room, the client sends {id: 47, roomId: 69}
        If the room is accessible and everything's okay, the server removes the player from the main lobby, puts him in that room and returns the same JSON
        + Every player in the room (except the new one) is sent the new player's JSON to update their view
        + The new player is sent a list of all the players in that room to update his view (ListEnrolledPlayers)
        If not, the server returns {id: 47, roomId: -1}
    */
    joinRoom : "joinRoom",


    /*
        The client sends {id: 47, roomId: 47}
        Now there are a few cases to consider
        If the player is the creator and the game hasn't started yet, every player in  the room is moved to the main lobby and is sent the same JSON
        Else if the player isn't the creator and the game hasn't started yet, only that player will be moved and sent the same JSON
        If the game has already started, wheter creator or not, only that player is moved and sent the same JSON. He is also considered having lost
        For every case, all the players moved to the main lobby will be sent a list of the available rooms and all the players remaining in the room will
        be sent the JSON of the player who left the room
        If there is only one remaining player and the game has started, he is considered the winner
        If the player isn't in that room, the server sends back {id: 47, roomId: -1}

        EXTRA : In the case where the creator of the game chooses a random angle at the beginning of each round, if he leaves a running game,
        a new player will have to be chosen as the new "master" of the game
    */
    leaveRoom : "leaveRoom",


    /* FOR FUTURE RELEASE
        As mentioned above, "In the case where the creator of the game chooses a random angle at the beginning of each round, if he leaves a running game,
        a new player will have to be chosen as the new "master" of the game "
        The server sends {id: 69, roomId: 47} to the new master that he has elected

    newMaster : "newMaster",
    */

    /*
        When a player enters a room he is sent a list of all the players currently in that room
        The server sends a simple array of player JSON
    */
    listEnrolledPlayers : "listEnrolledPlayers",
    /*
        Event fired when the server response is received
    */

    gotListEnrolledPlayers : "gotListEnrolledPlayers",

    /*
        When there is at least two players and the creator feels like it, he can send {id: 47, roomId: 47, angle: 0.8}
        where angle is an angle in radians at which the ball will be launched from the middle of the field
        If it's indeed the creator and the game hasn't started yet, every player in the room (including the creator) is sent {angle: 0.8}
        and it signals the effective start of the game
        If not, the client who requested the start is sent {id: 47, roomId: -1, angle: 0.8}
    */
    startGame : "startGame",


    /*
        Every x ms, each client sends the position of its local player(s) like :
        {
            "players":{
                "17":{"isLocal":true,"id":"17","score":5,"position":18},
                "32":{"isLocal":true,"id":"32","score":2,"position":400}
            },
            "roomId":15487
        }

        Witch each PlayerState, the server will be able to hold the general GameState
        Every x ms, the server sends the same json but with the position of all the players in the game

        NOTE : although the roomId isn't absolutely mandatory, it can be used to hasten the research in the server, depending on its implementation
    */
    playerStateUpdate : "playerStateUpdate",


    /*
        When a game ends, every client involved sends the same json as the one for PlayerSate but with all the players
        The server chooses the most commonly attributed score for each player to counter cheating

        NOTE : the state of the game is thus "finished", we can then let the room alive while not everyone has left it (so the winner can brag
        in a potential chat "EZ u all suk lel")
    */
    endGame : "endGame",

    /*
        When the client wants to sign in to the server
     */
    signIn : "signIn",

    /*
        Event fired when the server wants to update players score on the database
     */
    updateScores : "updateScores",

    /*
        Event fired when some weirdo is ejected from room because he is too slow
        Client sends a JSON like this : {id: 47, roomId: 88}
        If slowpokeLimit is reached, Eject him from room by sending him a leaveRoom JSON answer
     */
    kickSlowpoke : "kickSlowpoke"
};
