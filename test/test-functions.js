/**
 * Created by jacques on 24-11-16.
 */
let eventEnum = require("../src/common/events.js");
const assert = require('assert');

module.exports = {
    createPlayer : function(socket, playerJson , callback) {

        socket.emit(eventEnum.NewPlayer ,  playerJson );

        socket.on(eventEnum.NewPlayer, function (data) {

            try {
                assert.notEqual( data.id,-1 , 'No UserId');
                callback(null, data);
            } catch (err) {
                callback(err,null)
            }

        });
    },

    createRoom : function(socket, playerJson, callback) {

        socket.emit(eventEnum.CreateRoom , playerJson );

        socket.on(eventEnum.CreateRoom, function (data) {

            try {
                assert.deepEqual( data.id, playerJson.id , 'Not same UserId');
                assert.notEqual( data.roomId,-1 , 'No RoomId ');
                callback(null,data);
            } catch (err) {
                callback(err,null);
            }

        });
    },

    joinRoom : function(socket, playerJson , playersRoomJson , callback) {

        socket.emit(eventEnum.JoinRoom , playerJson );

        try {
            // check if the player has joined the room
            socket.on(eventEnum.JoinRoom , function (data) {

                assert.deepEqual( data.id, playerJson.id , 'Not same UserId');
                assert.notEqual( data.roomId,-1 , 'No RoomId ');
            });

            // check if the player receives the current list of players of this room
            socket.on(eventEnum.ListEnrolledPlayers, function (players) {

                assert.deepEqual( players, playersRoomJson, 'Not same players arrays');
            });
            callback(null,null);
        } catch (err) {
            callback(err,null);
        }

    },

    getAvailableRooms : function (socket, roomsJson, callback) {

        socket.emit(eventEnum.GetAvailableRooms , {});

        try {

            // check if roomsJson is equals to receivedRoomsJson

            socket.on(eventEnum.GetAvailableRooms , function (receivedRoomsJson) {

                assert.deepEqual(receivedRoomsJson, roomsJson, "Wrong Rooms List");
                callback(null,null);
            });

        } catch (err) {
            callback(err,null);
        }

    },

    startGame : function (sockets, masterSocket, masterJson, callback) {

        masterSocket.emit(eventEnum.StartGame , masterJson);

        try {

            sockets.forEach( (socket) => {

                socket.on(eventEnum.StartGame , function (data) {
                    assert.deepEqual(data.id, masterJson.id, "Wrong User Id");
                    assert.deepEqual(data.roomId, masterJson.roomId, "Wrong Room Id");
                    assert.notEqual(data.angle, undefined , "No angle");

                });

            });
            callback(null);
        } catch (err) {
            callback(err);
        }
    },

    leaveRoom : function(socketRageExit, playerJson , anotherPlayer, callback) {

        socketRageExit.emit(eventEnum.LeaveRoom , playerJson );

        try {
            // check if the player has joined the room
            socketRageExit.on(eventEnum.LeaveRoom , function (data) {
                // {id: 47, roomId: -1}
                assert.deepEqual( data.id, playerJson.id , 'Not same UserId');
                assert.notEqual( data.roomId,-1 , 'Not in this room');
            });

            // check if one of current player receives the current list of players of this room
            anotherPlayer.on(eventEnum.LeaveRoom, function (data) {

                assert.deepEqual( data.id, playerJson.id , 'Not same UserId');
                assert.notEqual( data.roomId,-1 , 'No same RoomId');
            });
            callback(null,null);
        } catch (err) {
            callback(err,null);
        }

    },

    GameState : function (sockets, goodAnswer, callback) {

        try {

            sockets.forEach( (socket) => {
                socket.on(eventEnum.GameState, function (data) {

                    console.log("TEST A CORRIGER SUREMENT");
                    console.log(data);

                    assert.deepEqual( data, goodAnswer , 'Not the same GameState Received');
                });
            });
            callback(null,null);

        } catch (err) {
            callback(err,null);
        }

    }

};
