/**
 * Created by jacques on 24-11-16.
 */
let eventEnum = require("../src/events.js");
const assert = require('assert');

/**
 * Wrapper-Class for done-function
 * @param {Function} fn
 * @class {Done}
 */

module.exports = {

    // Just in cast callbacks are called twice : Mocha has something strange problems with asynch function
    doneWrapper : function (fn) {
        let self   = this;
        let called = false;

        /**
         *
         * @param {*} params...
         */
        this.trigger = function (params) {
            if(called) {
                return;
            }

            fn.apply(self, arguments);
            called = true;
        };
    },

    createPlayer : function(socket, playerJson , callback) {

        socket.emit(eventEnum.newPlayer ,  JSON.stringify(playerJson) );

        socket.on(eventEnum.newPlayer, function (data) {

            data = JSON.parse(data);

            try {
                assert.notEqual( data.id,-1 , 'No UserId');
                callback(null, data);
            } catch (err) {
                callback(err,null);
            }

        });
    },

    createRoom : function(socket, playerJson, callback) {

        socket.emit(eventEnum.createRoom , JSON.stringify(playerJson) );

        socket.on(eventEnum.createRoom, function (data) {
            data = JSON.parse(data);
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

        socket.emit(eventEnum.joinRoom , JSON.stringify(playerJson) );

        try {
            // check if the player has joined the room
            socket.on(eventEnum.joinRoom , function (data) {
                data = JSON.parse(data);
                assert.deepEqual( data.id, playerJson.id , 'Not same UserId');
                assert.notEqual( data.roomId,-1 , 'No RoomId ');
            });

            // check if the player receives the current list of players of this room
            socket.on(eventEnum.ListEnrolledPlayers, function (players) {
                players = JSON.parse(players);
                assert.deepEqual( players, playersRoomJson, 'Not same players arrays');
            });
            callback(null,null);
        } catch (err) {
            callback(err,null);
        }

    },

    getAvailableRooms : function (socket, roomsJson, callback) {

        socket.emit(eventEnum.getAvailableRooms , JSON.stringify({}));

        try {

            // check if roomsJson is equals to receivedRoomsJson

            socket.on(eventEnum.getAvailableRooms , function (receivedRoomsJson) {

                assert.deepEqual( receivedRoomsJson, JSON.stringify(roomsJson), "Wrong Rooms List");
                callback(null,null);
            });

        } catch (err) {
            callback(err,null);
        }

    },

    startGame : function (sockets, masterSocket, masterJson, callback) {

        masterSocket.emit(eventEnum.startGame , JSON.stringify(masterJson) );

        try {

            sockets.forEach( (socket) => {

                socket.on(eventEnum.startGame , function (data) {
                    data = JSON.parse(data);
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

        socketRageExit.emit(eventEnum.leaveRoom , JSON.stringify(playerJson) );

        try {
            // check if the player has joined the room
            socketRageExit.on(eventEnum.leaveRoom , function (data) {
                data = JSON.parse(data);
                assert.deepEqual( data.id, playerJson.id , 'Not same UserId');
                assert.notEqual( data.roomId,-1 , 'Not in this room');
            });

            // check if one of current player receives the current list of players of this room
            anotherPlayer.on(eventEnum.leaveRoom, function (data) {
                data = JSON.parse(data);
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
            // each player sends example state :
            sockets.forEach( (socket) => {
                socket.emit(eventEnum.playerStateUpdate, JSON.stringify(goodAnswer) );
            });

            // wait some time to let server prepare answer
            setTimeout(function () {

            }, 20);
            
            // check server answer
            sockets.forEach( (socket) => {
                socket.on(eventEnum.playerStateUpdate, function (data) {
                    data = JSON.parse(data);
                    assert.deepEqual(data,JSON.stringify(goodAnswer), "Not the same GameState Received" );
                });
            });

            callback(null,null);

        } catch (err) {
            callback(err,null);
        }

    },
    
    RageExit : function (socketRageExit, socketAnotherPlayer , playerJson , callback) {

        socketRageExit.emit('disconnect');

        try {

            // check if the player has leave the room
            socketRageExit.on(eventEnum.leaveRoom , function (data) {
                data = JSON.parse(data);
                assert.deepEqual( data.id, playerJson.id , 'Not same UserId');
                assert.notEqual( data.roomId,-1 , 'Not in this room');
            });

            // check if one of current player receives the current list of players of this room
            socketAnotherPlayer.on(eventEnum.leaveRoom, function (data) {
                data = JSON.parse(data);
                assert.deepEqual( data.id, playerJson.id , 'Not same UserId');
                assert.notEqual( data.roomId,-1 , 'No same RoomId');
            });
            callback(null,null);

        } catch (err) {
            callback(err,null);
        }

    }

};
