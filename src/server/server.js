/**
 * Created by jacques on 10-11-16.
 */

const props = require('../properties-loader.js');
let eventsEnum = require(props.eventsEnumPath());
let mongoDb = require('./database/database-mongodb.js');

module.exports.listen = function () {

    let app = require('express')();
    let server = require('http').Server(app);
    let io = require('socket.io')(server);
    let bodyParser = require('body-parser');

    server.listen(props.socketProps.port);

    // parse application/json
    app.use(bodyParser.json());

    // init Db connection

    app.use(function(req, res, next) {

        // We lost connection! (Maybe due to IPL network XD)
        mongoDb.connectToDatabase( (err) => {
            if (err) {
                console.log(err.message);
                res.status(503);
            }
            else{
                next();
            }
        });

    });


    app.post("/registerUser", function (req,res) {
        mongoDb.registerUser(req.body, (err) =>{
            if(err){
                res.status(409).send(err.message);
            }
            else{
                res.status(200).send('Successfully created');
            }
            //mongoDb.closeConnection(); NE PAS ACTIVER : DANGER
        });
    });

    app.post("/checkUserCredentials", function (req,res){
        mongoDb.checkUserCredentials(req.body, (err, user) =>{
            if(err){
                res.status(422).send(err.message);
            }
            else{
                res.status(200).send(user);
            }
            //mongoDb.closeConnection(); NE PAS ACTIVER : DANGER
        });
    });

    /*
    app.get("/scores" , function (req,res) {

    });
    */

    io.on("connection", function (socket) {

        // NB : I do it here because mongoDb cannot be anywhere than HERE (just not trying asking, response is NO)
        // trigger when someone wants to connect to our Game Server
        socket.on(eventsEnum.SignIn, function (data)  {
            mongoDb.checkUserCredentials( { email : data.email , pwd : data.password } , (err, user) =>{

                if(!err){
                    require("./server-logic/routes.js").newPlayerWhenSignIn(socket,user._id,{name: user.username });
                } else {
                    socket.emit(eventsEnum.newPlayer, { id : -1} );
                }
                //mongoDb.closeConnection(); NE PAS ACTIVER : DANGER
            });
        });

        // another socket events listeners
        require("./server-logic/routes.js").gestionSocket(socket);
    });

    let gameEventEmitter = require("./server-logic/gameEventEmitter.js").commonEmitter;

    gameEventEmitter.on( eventsEnum.gameStateUpdate, function (data) {

        require("./server-logic/routes.js").gameStateUpdate(data);

    });

    // still cannot use that because the end gameState is currently missing :
    // emit eventsEnum.updateScores with gameEventEmitter to arrive here
    gameEventEmitter.on( eventsEnum.updateScores, function (data) {

        require("./server-logic/routes.js").getRequiredDataForScore( function (lobbyData) {

            let sockets = new Set();
            let bestRecordScore = -1;
            let bestRecordUserKey;
            let bestRecordSocketKey;

            // get the sockets of all players from this game
            for ( let [key,value] of data.players ) {

                // store the user socket
                let mySocket = lobbyData.playersToSocket.get(key);
                sockets.add(mySocket);

                // check if current player has the best score
                if ( bestRecordScore < value.score) {
                    bestRecordScore = value.score;
                    bestRecordUserKey = key;
                    bestRecordSocketKey = mySocket.id;
                }

            }

            // check if there is a winner
            // if there are two or more players on the same socket ,
            // => No winner
            // Resume : the winner should be the first user on the socket
            if ( (lobbyData.idToSockets.get(bestRecordSocketKey).players)[0] === bestRecordUserKey ) {

                let UserIdDatabase = lobbyData.socketIdtoIdDb.get(bestRecordSocketKey);

                // mongoDb , do your job : updateScoreAndAddVictory
                mongoDb.updateScoreAndAddVictory({score : bestRecordScore , id : UserIdDatabase }, function (err) {
                    require("./server-logic/routes.js").winston.log( (err) ? 'warn': 'info', "Save the winner inside the database " + ( (err) ? " with message " + err.message : " successfully") );
                });
            }

            // Others players get their participation incremented :)
            for ( let key of monSet.keys() ) {

                // except the one who probably wins
                if (key !== bestRecordSocketKey) {

                    let UserIdDatabase = lobbyData.socketIdtoIdDb.get(key);

                    // mongoDb , do your job : updateScore
                    mongoDb.updateScore({id : UserIdDatabase }, function (err) {
                        require("./server-logic/routes.js").winston.log( (err) ? 'warn': 'info', "Save the winner inside the database " + ( (err) ? " with message " + err.message : " successfully") );
                    });

                }

            }

        });

    });

};
