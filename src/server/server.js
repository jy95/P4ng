/**
 * Created by jacques on 10-11-16.
 */
let socketio = require('socket.io');
const props = require('../properties-loader.js')
let eventsEnum = require(props.eventsEnumPath());

module.exports.listen = function () {
    let io = socketio.listen(props.socketProps.port);

    io.on("connection", function (socket) {

        require("./server-logic/routes.js").gestionSocket(socket,io.sockets);
    });

    let gameEventEmitter = require("./server-logic/gameEventEmitter.js").commonEmitter;

    gameEventEmitter.on( eventsEnum.gameStateUpdate, function (data) {
        require("./server-logic/routes.js").gameStateUpdate(data,io.sockets);

    });

};
