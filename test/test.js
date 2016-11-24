const assert = require('assert');
let io = require('socket.io-client');
let testFunctions = require("./test-functions.js");

let player1 = {name: "Jacques" };
let player2 = {name: "BUG CO" };

let socket1;
let socket2;
let roomId1;
let playersRoomJson1;

describe('Server tests : ' , function () {

    describe('Create and connect to a Server : ', function () {

        it('Test n°1 : Should create a Server' , function () {

            require('../src/server/server.js').listen();

        });

        // shup up winstom log
        let winstom = require('../src/server/routes.js').winston;
        winstom.remove(winstom.transports.Console);

        it('Test n°2 : Should be possible for client to connect on this Server', function () {
            this.timeout(100);

            let socket = io.connect('http://localhost:8080');
            socket.on('connect', function (socket) {
                assert.equal(true,true);
            });
        });

    });

    describe('Server answers tests :' , function () {

        it('Test n°3 : Should be able to register a new user' ,function (done) {
            this.timeout(100);

            socket1 = io.connect('http://localhost:8080');
            testFunctions.createPlayer(socket1,player1, function (err,data) {

                if (!err) {
                    player1.id = data.id;
                    done();
                } else {
                    done(err);
                }
            });

        });

        it('Test n°4 : Should be able to register a another new user' ,function (done) {
            this.timeout(100);

            socket2 = io.connect('http://localhost:8080');
            testFunctions.createPlayer(socket2,player2, function (err,data) {

                if (err) {
                    done(err);
                } else {
                    player2.id = data.id;
                    done();
                }

            });

        });

        it('Test n°5 : Should be able to create a room' , function (done) {
            this.timeout(100);
            player1.roomdId = -1;
            player1.roomName = "TestRoom";

            testFunctions.createRoom(socket1,player1, function (err,data) {

                if (err) {
                    done(err);
                } else {
                    player1.roomId = data.roomdId;
                    roomId1 = data.roomdId;
                    done();
                }

            });

        });


        it('Test n°6 : Should be able to join a room', function (done) {
            this.timeout(100);

            player2.roomId = roomId1;
            playersRoomJson1 = [
                {
                    "playerName": "Jacques",
                    "playerId" : player1.id,
                    "playerNumber": 0
                }
            ];

            testFunctions.joinRoom(socket2,player2, playersRoomJson1 , function (err,data) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });

        });

        // TODO TO BE IMPLEMENTED
        it('Test n°7 : Should be able to start the game' , function (done) {
            this.timeout(100);
            try {
                assert.equal(true,true);
                done();
            } catch (err) {
                done(err);
            }
        });

        // TODO TO BE IMPLEMENTED
        it('Test n°8 : Should be able to leave the game' , function (done) {
            this.timeout(100);
            try {
                assert.equal(true,true);
                done();
            } catch (err) {
                done(err);
            }
        });

    });

});
