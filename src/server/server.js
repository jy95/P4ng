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
        });
    });

    app.get("/scores" , function (req,res) {

    });

    io.on("connection", function (socket) {

        require("./server-logic/routes.js").gestionSocket(socket,io.sockets);
    });

    let gameEventEmitter = require("./server-logic/gameEventEmitter.js").commonEmitter;

    gameEventEmitter.on( eventsEnum.gameStateUpdate, function (data) {
        require("./server-logic/routes.js").gameStateUpdate(data,io.sockets);

    });

};
