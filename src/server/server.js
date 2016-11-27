/**
 * Created by jacques on 10-11-16.
 */
let socketio = require('socket.io');
let eventsEnum = require('../common/events.js');

module.exports.listen = function () {
    let io = socketio.listen(8080);

    io.on("connection", function (socket) {

        require("./routes.js").gestionSocket(socket,io.sockets);
    });

    let gameEventEmitter = require("./gameEventEmitter.js").commonEmitter;

    gameEventEmitter.on( eventsEnum.gameStateUpdate, function (data) {
        require("./routes.js").GameState(data,io.sockets);

    });

};


