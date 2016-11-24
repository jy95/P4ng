/**
 * Created by jacques on 10-11-16.
 */
let socketio = require('socket.io');


module.exports.listen = function () {
    let io = socketio.listen(8080);

    io.on("connection", function (socket) {

        require("./routes.js").gestionSocket(socket,io.sockets);
    });
};

