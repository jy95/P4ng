/**
 * Created by jacques on 10-11-16.
 */
let socketio = require('socket.io');
let eventsEnum = require('../common/events.js');
let gameEventEmitter = require("./gameEventEmitter.js").commonEmitter;

module.exports.listen = function () {
    let io = socketio.listen(8080);

    io.on("connection", function (socket) {

        require("./routes.js").gestionSocket(socket,io.sockets);
    });

    gameEventEmitter.on( eventsEnum.GameState, function (data) {

        require("./routes.js").gestionSocket(data,io.sockets);

    });

};


