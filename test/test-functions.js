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
                assert.notEqual( data.roomdId,-1 , 'No RoomId ');
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
                assert.notEqual( data.roomdId,-1 , 'No RoomId ');
            });

            // check if the player receives the current list of players of this room
            socket.on(eventEnum.ListEnrolledPlayers, function (players) {

                assert.deepEqual( players, playersRoomJson, 'Not same players arrays');
            });
            callback(null,null);
        } catch (err) {
            callback(err,null);
        }

    }
};
