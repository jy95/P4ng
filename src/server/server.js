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

    server.listen(props.socketProps.port);

    // init Db connection
    mongoDb.createDatabase( (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("MongoDb started");
        }
    });

    app.post("/registerUser", function (req,res) {
        let email = req.body.userName;
        let pwd = req.body.pwd;
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
