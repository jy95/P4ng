
const props = require('../properties-loader.js');
const secretJwtKey = props.secretJwtKey;
let eventsEnum = require(props.eventsEnumPath());
let mongoDb = require('./database/database-mongodb.js');
let jwt = require('jsonwebtoken');

module.exports.listen = function () {

    let app = require('express')();
    let server = require('http').Server(app);
    let io = require('socket.io')(server);
    let bodyParser = require('body-parser');

    server.listen(props.socketProps.port);

    // parse application/json
    app.use(bodyParser.json());

    app.post("/registerUser", function (req,res) {
        mongoDb.registerUser(req.body, (err, user) =>{
            if(err){
                res.status(409).send(err.message);
            }
            else{
                let rep = {'jwt': jwt.sign({idDb: user._id, username: user.username}, secretJwtKey)};
                res.status(200).send(JSON.stringify(rep));
            }
        });
    });

    app.post("/checkUserCredentials", function (req,res){
        mongoDb.checkUserCredentials(req.body, (err, user) =>{
            if(err){
                res.status(422).send(err.message);
            }
            else{
                let rep = {'jwt': jwt.sign({idDb: user._id, username: user.username}, secretJwtKey)};
                res.status(200).send(JSON.stringify(rep));
            }
        });
    });


    io.on("connection", function (socket) {

        socket.on(eventsEnum.signIn, function (data)  {

            jwt.verify(data.jwt, secretJwtKey, function(err, decoded) {
                if (err) {
                    socket.emit(eventsEnum.newPlayer, { id : -1} );
                } else {

                    require("./server-logic/routes.js").newPlayerWhenSignIn(socket,decoded.idDb,{name: decoded.username });
                }
            });

        });

        // another socket events listeners
        require("./server-logic/routes.js").gestionSocket(socket);
    });

    let gameEventEmitter = require("./server-logic/gameEventEmitter.js").commonEmitter;

    gameEventEmitter.on( eventsEnum.playerStateUpdate, function (data) {

        require("./server-logic/routes.js").gameStateUpdate(data);

    });


    gameEventEmitter.on(eventsEnum.kickSlowpoke, function (data) {
        require("./server-logic/routes.js").kickSlowpoke(data.playerId,data.roomId);
    });

    gameEventEmitter.on( eventsEnum.updateScores, function (data) {

        require("./server-logic/routes.js").getRequiredDataForScore( function (lobbyData) {

            let sockets = new Set();
            let bestRecordScore = -1;
            let bestRecordUserKey;
            let bestRecordSocketKey;

            // get the sockets of all players from this game
            for ( let key in data ) {

                if ( data.hasOwnProperty(key)) {
                    // store the user socket
                    let mySocket = lobbyData.playersToSocket.get(key);
                    sockets.add(mySocket);

                    // check if current player has the best score
                    if ( bestRecordScore < data[key]) {
                        bestRecordScore = data[key];
                        bestRecordUserKey = key;
                        bestRecordSocketKey = mySocket.id;
                    }
                }
            }

            // check if there is a winner
            // if there are two or more players on the same socket ,
            // => No winner
            // Resume : the winner should be the first user on the socket

            if ( (bestRecordSocketKey !== undefined && lobbyData.idToSockets.get(bestRecordSocketKey).players)[0] === bestRecordUserKey ) {

                let UserIdDatabase = lobbyData.socketIdtoIdDb.get(bestRecordSocketKey);

                // Only players who has an account
                if (UserIdDatabase !== undefined ) {

                    // mongoDb , do your job : updateScoreAndAddVictory
                    mongoDb.updateScoreAndAddVictory({score: bestRecordScore, id: UserIdDatabase}, function (err) {
                        require("./server-logic/routes.js").winston.log((err) ? 'warn' : 'info', "Save the winner inside the database " + ( (err) ? " with message " + err.message : " successfully"));
                    });
                }
            }

            // all players get their participation incremented :)
            for ( let socket of sockets.keys() ) {

                    let UserIdDatabase = lobbyData.socketIdtoIdDb.get(socket.id);

                    // Only players who has an account
                    if (UserIdDatabase !== undefined ) {

                        // mongoDb , do your job : updateScore
                        mongoDb.updateScore({id : UserIdDatabase }, function (err) {
                            require("./server-logic/routes.js").winston.log( (err) ? 'warn': 'info', "Save the winner inside the database " + ( (err) ? " with message " + err.message : " successfully") );
                        });

                    }

                }

        });

    });

};
