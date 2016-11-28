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
        let winstom = require('../src/server/server-logic/routes.js').winston;
        winstom.remove(winstom.transports.Console);

        it('Test n°2 : Should be possible for client to connect on this Server', function () {
            this.timeout(100);

            let socket = io.connect('http://localhost:8080');
            socket.on('connect', function (socket) {
                assert.equal(true,true);
            });
        });

    });

    describe('Server tests :' , function () {

        describe('Test Cases n°1 : Register user test cases : ', function () {

            it('Test n°3 : Should be able to register a new user', function (done) {
                this.timeout(100);

                socket1 = io.connect('http://localhost:8080');
                testFunctions.createPlayer(socket1, player1, function (err, data) {

                    if (!err) {
                        player1.id = data.id;
                        done();
                    } else {
                        done(err);
                    }
                });

            });

            it('Test n°4 : Should be able to register a another new user', function (done) {
                this.timeout(100);

                socket2 = io.connect('http://localhost:8080');
                testFunctions.createPlayer(socket2, player2, function (err, data) {

                    if (err) {
                        done(err);
                    } else {
                        player2.id = data.id;
                        done();
                    }

                });

            });
        });

        describe('Test Cases n°2 : Room test cases : ', function () {

            it('Test n°5 : Should be able to create a room', function (done) {
                this.timeout(100);
                player1.roomId = -1;
                player1.roomName = "TestRoom";

                testFunctions.createRoom(socket1, player1, function (err, data) {

                    if (err) {
                        done(err);
                    } else {
                        player1.roomId = data.roomId;
                        roomId1 = data.roomId;
                        done();
                    }

                });

            });

            it("Test n°6 : Should be able to list the rooms ", function (done) {
                this.timeout(100);

                let expectedJson = [
                    {
                        "roomName": player1.roomName,
                        "roomId": roomId1,
                        "roomPlayers": [
                            {
                                "playerName": player1.name,
                                "playerId": player1.id,
                                "playerNumber": 0
                            }
                        ]
                    }];

                testFunctions.getAvailableRooms(socket2, expectedJson, function (err) {

                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });

            });

            it('Test n°7 : Should be able to join a room', function (done) {
                this.timeout(100);

                player2.roomId = roomId1;
                playersRoomJson1 = [
                    {
                        "playerName": "Jacques",
                        "playerId": player1.id,
                        "playerNumber": 0
                    }
                ];

                testFunctions.joinRoom(socket2, player2, playersRoomJson1, function (err) {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });

            });

            it('Test n°8 : Should be able to leave the game' , function (done) {
                this.timeout(150);

                let socketTest = io.connect('http://localhost:8080');
                let playerTest = {name: "RAGE EXIT" };

                testFunctions.createPlayer(socketTest, playerTest, function (err, data) {

                    if (err) {
                        done(err);
                    } else {
                        playerTest.id = data.id;
                    }

                });

                // set other player added in previous test
                playerTest.roomId = roomId1;
                playersRoomJson1.push(
                    {
                        "playerName": player2.name,
                        "playerId": player2.id,
                        "playerNumber": 1
                    }
                );

                testFunctions.joinRoom(socketTest, playerTest, playersRoomJson1, function (err) {
                    if (err) {
                        done(err);
                    }
                });

                testFunctions.leaveRoom(socketTest,playerTest,socket1, function (err) {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
            });

        });

        describe('Test Cases n°3 : Game test cases : ', function () {

            it('Test n°9 : Should not be able to start the game', function (done) {
                this.timeout(100);

                testFunctions.startGame([socket1, socket2], socket2, player2, function (err) {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });

            });

            it('Test n°10 : Should be able to start the game', function (done) {
                this.timeout(100);

                testFunctions.startGame([socket1, socket2], socket1, player1, function (err) {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });

            });

            it('Test n°11 : Should be able to receive GameState ', function (done) {
                this.timeout(250);
                let goodAnswer;

                testFunctions.GameState([socket1,socket2], goodAnswer, function (err) {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });

            });

        });

    });

});
