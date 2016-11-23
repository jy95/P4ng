const assert = require('assert');
let io = require('socket.io-client');
let eventEnum = require("../src/common/events.js");

let player1 = {};
let player2 = {};
let socket1;
let socket2;

describe('Server tests : ' , function () {

    describe('Create and connect to a Server : ', function () {

        it('Should create a Server' , function () {
            this.timeout(500);
            require('../src/server/server.js');
            assert.equal(true,true);
        });

        it('Should be possible for client to connect on this Server', function () {
            this.timeout(500);

            let socket = io.connect('http://localhost:8080');
            socket.on('connect', function (socket) {
                assert.equal(true,true);
            });
        });

    });

    describe('Server answers tests :' , function () {

        it('Should be able to register a new user' ,function () {
            this.timeout(500);

            socket1 = io.connect('http://localhost:8080');
            createPlayer(socket1,"Jacques", function (err,data) {
                if (!err) {
                    player1 = data;
                }
            });

        });

        it('Should be able to create a room' , function () {
            this.timeout(500);
            createRoom(socket1,player1,"TestRoom", function (err,data) {
                if (!err) {
                    player1 = data;
                }
            });

        });

        // TODO TO BE IMPLEMENTED
        it('Should be able to join a room', function () {
            this.timeout(500);

            socket2 = io.connect('http://localhost:8080');
            createPlayer(socket2,"BUG CO", function (err,data) {
                if (!err) {
                    player2 = data;
                }
            });




            assert.equal(true,true);
        });

        // TODO TO BE IMPLEMENTED
        it('Should be able to start the game' , function () {
            this.timeout(500);
            assert.equal(true,true);
        });

        // TODO TO BE IMPLEMENTED
        it('Should be able to leave the game' , function () {
            this.timeout(500);
            assert.equal(true,true);
        });

    });

});

function createPlayer(socket, userName , callback) {
    socket.emit(eventEnum.NewPlayer , {name: userName } );

    socket.on(eventEnum.NewPlayer, function (data) {

        try {
            assert.notEqual( data.id,-1 , 'No UserId');
            callback(null, data);
            assert.equal(true,true);
        } catch (err) {
            callback(err,null)
        }

    });
}

function createRoom(socket, playerJson, roomName, callback) {

    // modify the json to be send
    playerJson.roomName = roomName;
    playerJson.roomdId = -1;

    socket.emit(eventEnum.NewPlayer , playerJson );

    socket.on(eventEnum.NewPlayer, function (data) {

        try {
            assert.deepEqual( data.id, playerJson.id , 'Not same UserId');
            assert.deepEqual( data.roomName, playerJson.roomName , 'Not same RoomName');
            assert.notEqual( data.roomdId,-1 , 'No RoomId ');
            callback(null,data);
            assert.equal(true,true);
        } catch (err) {
            callback(err,null);
        }

    });
}

function joinRoom(socket, room, callback) {

    socket.on(eventEnum.ListEnrolledPlayers, function (data) {

    try {
        assert.equal(true,true);
    } catch (err) {
        callback(err,null);
    }

    });
}