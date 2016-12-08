const assert = require('assert');
const http = require('http');
const props = require('../src/properties-loader.js');
let io = require('socket.io-client');
let testFunctions = require("./test-functions.js");
let eventEnum = require('../src/events.js');

let player1 = {name: "Jacques" };
let player2 = {name: "TRUMP" };
let player3 = {name: "HELL OF CALLBACKS"};
let player4 = {name: "CHEATER"};

let socket1;
let socket2;
let roomId1;
let playersRoomJson1;


describe('Server tests : ' , function () {

    describe('Create and connect to a Server : ', function () {

        it('Test n°1 : Should create a Server' , function (done) {
            this.timeout(1500);
            require('../src/server/server.js').listen();
            done();
        });

        // shup up winstom log
        let winstom = require('../src/server/server-logic/routes.js').winston;
        winstom.remove(winstom.transports.Console);

        it('Test n°2 : Should be possible for client to connect on this Server', function (done) {
            this.timeout(250);

            let socket = io.connect(props.socketProps.url+":"+props.socketProps.port);
            socket.on('connect', function (socket) {
                done();
            });
        });

    });

    describe('Rest API test :' , function () {

        describe("Test Case n°1 : /registerUser tests", function () {

            it("Test n°1 : Should not registerUser : Wrong email ", function (done) {

                let data = {
                    "username": "TEST",
                    "pwd": "TEST",
                    "email": "TEST"
                };

                let options = {
                    host: props.socketProps.url.replace("http://", ""),
                    path: '/registerUser',
                    port: props.socketProps.port,
                    method: 'POST',
                    headers: {
                        "Content-Type" : "application/json;charset=UTF-8"
                    }
                };

                let req = http.request(options, function(res) {
                    assert.notEqual(res.statusCode,200);
                    done();
                });

                req.write(JSON.stringify(data));
                req.end();

            });

            it("Test n°2 : Should be able to registerUser ", function (done) {

                let data = {
                    "username": "Jacques",
                    "pwd": "TEST",
                    "email": "TEST@ipl.be"
                };

                let options = {
                    host: props.socketProps.url.replace("http://", ""),
                    path: '/registerUser',
                    port: props.socketProps.port,
                    method: 'POST',
                    headers: {
                        "Content-Type" : "application/json;charset=UTF-8"
                    }
                };

                let req = http.request(options, function(res) {
                    assert.equal(res.statusCode,200);
                    done();
                });

                req.write(JSON.stringify(data));
                req.end();

            });

            it("Test n°3 : Should not be able to registerUser with same Email", function (done) {

                let data = {
                    "username": "TEST",
                    "pwd": "TEST",
                    "email": "TEST@ipl.be"
                };

                let options = {
                    host: props.socketProps.url.replace("http://", ""),
                    path: '/registerUser',
                    //since we are listening on a custom port, we need to specify it by hand
                    port: props.socketProps.port,
                    //This is what changes the request to a POST request
                    method: 'POST',
                    headers: {
                        "Content-Type" : "application/json;charset=UTF-8"
                    }
                };

                let req = http.request(options, function(res) {
                    assert.notEqual(res.statusCode,200);
                    done();
                });

                req.write(JSON.stringify(data));
                req.end();
            });


        });

        describe("Test Case n°2 : /checkUserCredentials tests", function () {
            it("Test n°1 : Should not be able to /checkUserCredentials : Wrong Email", function (done) {

                let data = {
                    "username": "TEST",
                    "pwd": "TEST",
                    "email": "TEST@KKKL.be"
                };

                let options = {
                    host: props.socketProps.url.replace("http://", ""),
                    path: '/checkUserCredentials',
                    port: props.socketProps.port,
                    method: 'POST',
                    headers: {
                        "Content-Type" : "application/json;charset=UTF-8"
                    }
                };

                let req = http.request(options, function(res) {
                    assert.notEqual(res.statusCode,200);
                    done();
                });

                req.write(JSON.stringify(data));
                req.end();
            });

            it("Test n°2 : Should not be able to /checkUserCredentials : Wrong Password", function (done) {

                let data = {
                    "username": "TEST",
                    "pwd": "HACKEDPWD",
                    "email": "TEST@ipl.be"
                };

                let options = {
                    host: props.socketProps.url.replace("http://", ""),
                    path: '/checkUserCredentials',
                    port: props.socketProps.port,
                    method: 'POST',
                    headers: {
                        "Content-Type" : "application/json;charset=UTF-8"
                    }
                };

                let req = http.request(options, function(res) {
                    assert.notEqual(res.statusCode,200);
                    done();
                });

                req.write(JSON.stringify(data));
                req.end();
            });

            it("Test n°2 : Should  be able to /checkUserCredentials", function (done) {

                let data = {
                    "username": "Jacques",
                    "pwd": "TEST",
                    "email": "TEST@ipl.be"
                };

                let options = {
                    host: props.socketProps.url.replace("http://", ""),
                    path: '/checkUserCredentials',
                    port: props.socketProps.port,
                    method: 'POST',
                    headers: {
                        "Content-Type" : "application/json;charset=UTF-8"
                    }
                };

                let req = http.request(options, function(res) {
                    assert.equal(res.statusCode,200);
                    done();
                });

                req.write(JSON.stringify(data));
                req.end();
            });


        });
    });

    describe('Server tests :' , function () {

        beforeEach(function(done) {
            // runs after each test in this block

            // removes previously listeners to this two sockets (seen in anothers test)
            for (let socketTest of [socket1,socket2] ) {
                if (socketTest !== undefined) {
                    socketTest.removeAllListeners();
                }
            }
            done();
        });

        describe('Test Cases n°1 : Register user test cases : ', function () {

            it('Test n°1 : Should be able to register a new user: Player 1 - With sign in', function (done) {

                socket1 = io.connect(props.socketProps.url+":"+props.socketProps.port);

                socket1.emit(eventEnum.SignIn, {email : "TEST@ipl.be",  password : "TEST" } );

                socket1.on(eventEnum.newPlayer, function (data) {
                    assert.notDeepEqual(data.id,-1,"Wrong email/passwd");
                    player1.id = data.id;
                    done();
                });

            });

            it('Test n°2 : Should be able to register a another new user : Player 2', function (done) {
                this.timeout(250);

                socket2 = io.connect(props.socketProps.url+":"+props.socketProps.port);
                testFunctions.createPlayer(socket2, player2, function (err, data) {

                    if (err) {
                        done(err);
                    } else {
                        player2.id = data.id;
                        done();
                    }

                });

            });

            it('Test n°3 : Should be able to register a another new user : Player 3 (on socket 2)', function (done) {
                this.timeout(250);

                testFunctions.createPlayer(socket2, player3, function (err, data) {

                    if (err) {
                        done(err);
                    } else {
                        player3.id = data.id;
                        done();
                    }

                });

            });

            it('Test n°4 : Should be able to register a new user: Player 4 (on socket 1)', function (done) {
                this.timeout(250);

                testFunctions.createPlayer(socket1, player4, function (err, data) {

                    if (!err) {
                        player4.id = data.id;
                        done();
                    } else {
                        done(err);
                    }
                });

            });
        });

        describe('Test Cases n°2 : Room test cases : ', function () {

            describe("Test case n°2 A : Create Room test" , function () {
                it('Test n°1 : Should not be able to create a room', function (done) {
                    this.timeout(400);

                    testFunctions.createRoom(socket1, { id : -1 ,roomName : "TEST" , roomId : -1} , function (err, data) {

                        if (err) {
                            done();
                        } else {
                            done(err);
                        }

                    });

                });

                it('Test n°2 : Should be able to create a room - Mast: Player1', function (done) {
                    this.timeout(250);
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
            });

            describe("Test case n°2 B : List Rooms tests" , function () {
                it("Test n°1 : Should be able to list the rooms ", function (done) {
                    this.timeout(250);

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
            });

            describe("Test case n°2 C : Join Room" ,function () {

                it('Test n°1 : Should not be able to join a room', function (done) {
                    this.timeout(250);

                    let wrong = player2;
                    wrong.id = -1;
                    playersRoomJson1 = [
                        {
                            "playerName": "Jacques",
                            "playerId": player1.id,
                            "playerNumber": 0
                        }
                    ];

                    testFunctions.joinRoom(socket2, wrong, playersRoomJson1, function (err) {
                        if (err) {
                            done();
                        } else {
                            done(err);
                        }
                    });
                });

                it('Test n°2 : Should not be able to join a room', function (done) {
                    this.timeout(250);

                    player2.roomId = -1;
                    playersRoomJson1 = [
                        {
                            "playerName": "Jacques",
                            "playerId": player1.id,
                            "playerNumber": 0
                        }
                    ];

                    testFunctions.joinRoom(socket2, player2, playersRoomJson1, function (err) {
                        if (err) {
                            done();
                        } else {
                            done(err);
                        }
                    });
                });

                it('Test n°3 : Should be able to join a room : Player2 joins Player1 room', function (done) {
                    this.timeout(250);

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

                it('Test n°4 : Should be able for another player to join a room : Player3 on Player 2 socket joins Player1 room', function (done) {
                    this.timeout(500);

                    player3.roomId = roomId1;
                    playersRoomJson1.push(
                        {
                            "playerName": player2.name,
                            "playerId": player2.id,
                            "playerNumber": 1
                        }
                    );

                    testFunctions.joinRoom(socket2, player3, playersRoomJson1, function (err) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });

                });


            });

            describe("Test case n°2 D : Leave Room", function () {

                it('Test n°1 : Should not be able to leave the game', function (done) {
                    this.timeout(250);

                    let playerTest = { id : -1};

                    testFunctions.leaveRoom(socket2,playerTest,socket1, function (err) {
                        if (err) {
                            done();
                        } else {
                            done(err);
                        }
                    });

                });

                it('Test n°2 : Should not be able to leave the game', function (done) {
                    this.timeout(250);

                    let playerTest = { id : player2.id , roomId : -1};

                    testFunctions.leaveRoom(socket2,playerTest,socket1, function (err) {
                        if (err) {
                            done();
                        } else {
                            done(err);
                        }
                    });

                });

                it('Test n°3 : Should be able to leave the game' , function (done) {
                    this.timeout(1000);

                    let socketTest = io.connect(props.socketProps.url+":"+props.socketProps.port);
                    let playerTest = {name: "RAGE EXITZ" };

                    testFunctions.createPlayer(socketTest, playerTest, function (err, data) {

                        if (err) {
                            done(err);
                        } else {
                            playerTest.id = data.id;

                            // set other player added in previous test
                            playerTest.roomId = roomId1;
                            playersRoomJson1.push(
                                {
                                    "playerName": player3.name,
                                    "playerId": player3.id,
                                    "playerNumber": 2
                                }
                            );

                            testFunctions.joinRoom(socketTest, playerTest, playersRoomJson1, function (err) {
                                if (err) {
                                    done(err);
                                }

                                testFunctions.leaveRoom(socketTest,playerTest,socket1, function (err) {
                                    if (err) {
                                        done(err);
                                    } else {
                                        done();
                                    }
                                });

                            });

                        }
                    });

                });


            });

        });

        describe('Test Cases n°3 : Game test cases : ', function () {

            describe("Test case n°3 A : Start game" , function () {
                it('Test n°1 : Should not be able to start the game', function (done) {
                    this.timeout(250);

                    testFunctions.startGame([socket1, socket2], socket2, player2, function (err) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });

                });

                it('Test n°2 : Should not be able to start the game', function (done) {
                    this.timeout(250);
                    let wrong = player2;
                    wrong.id = -1;

                    testFunctions.startGame([socket1, socket2], socket2, wrong, function (err) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });

                });

                it('Test n°3 : Should not be able to start the game', function (done) {
                    this.timeout(250);
                    let wrong = player2;
                    wrong.roomId = -1;

                    testFunctions.startGame([socket1, socket2], socket2, wrong, function (err) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });

                });

                it('Test n°4 : Should not be able to start the game', function (done) {
                    this.timeout(250);

                    testFunctions.startGame([socket1, socket2], socket2, player2, function (err) {
                        if (err) {
                            done();
                        } else {
                            done(err);
                        }
                    });

                });

                it('Test n°5 : Should be able to start the game', function (done) {
                    this.timeout(250);

                    player1.angle = 1.3;

                    testFunctions.startGame([socket1, socket2], socket1, player1, function (err) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });

                });
            });

            describe("Test case n°3 B : GameState", function () {

                it('Test n°1 : Should be able to receive GameState ', function (done) {
                    this.timeout(350);

                    let keyPlayer1 = player1.id.toString();
                    let keyPlayer2 = player2.id.toString();

                    let someScoreStuff = {
                      roomId : roomId1,
                        players : {
                            keyPlayer1 :{"isLocal":true,"id":keyPlayer1,"score":5,"position":18},
                            keyPlayer2 :{"isLocal":true,"id":keyPlayer2,"score":2,"position":18}
                        }
                    };


                    testFunctions.GameState([socket1,socket2], someScoreStuff, function (err) {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });

                });

                it('Test n°2 : Should not be able to receive GameState ', function (done) {
                    this.timeout(350);

                    let keyPlayer1 = player1.id.toString();
                    let keyPlayer2 = player2.id.toString();

                    let someScoreStuff = {
                        roomId : -1,
                        players : {
                            keyPlayer1 :{"isLocal":true,"id":keyPlayer1,"score":5,"position":18},
                            keyPlayer2 :{"isLocal":true,"id":keyPlayer2,"score":2,"position":18}
                        }
                    };


                    testFunctions.GameState([socket1,socket2], someScoreStuff, function (err) {
                        if (err) {
                            done();
                        } else {
                            done(err);
                        }
                    });

                });
            });

            describe("Test case n°4 C : End Game + newMaster", function () {
                it("Test n°1 : Wrong room", function (done) {
                    this.timeout(250);

                    let keyPlayer1 = player1.id.toString();
                    let keyPlayer2 = player2.id.toString();

                    let someScoreStuff = {
                        roomId : roomId1,
                        players : {
                            keyPlayer1 :{"isLocal":true,"id":keyPlayer1,"score":5,"position":18},
                            keyPlayer2 :{"isLocal":true,"id":keyPlayer2,"score":2,"position":18}
                        }
                    };

                    socket2.emit(eventEnum.endGame, someScoreStuff);

                    try {
                        socket2.on(eventEnum.endGame, function (data) {
                            assert.equal(JSON.stringify(data),JSON.stringify(someScoreStuff),"No same playerState");
                        });
                        done();
                    } catch (err) {
                        done(err);
                    }

                });

                it("Test n°2 : Typisch way to end Game" , function (done) {
                    done();
                });

                it("Test n°3 : newMaster  ", function (done) {

                        this.timeout(500);

                        testFunctions.RageExit(socket1,socket2,player1 , function (err) {
                            if (err) {
                                done(err);
                            } else {
                                testFunctions.NewMaster(socket2,player2 , function (err) {
                                    if (err) {
                                        done(err);
                                    } else {
                                        done();
                                    }
                                });
                            }
                        });

                });

            });

        });

    });

});
