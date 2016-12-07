let async = require("async");

module.exports = {

    sendMessage: function (socket, event, message) {
        socket.emit(event, message);
    },

    broadcastMessageInRoom : function (sockets, event, data) {

        async.forEach(sockets, function (socket, callback){
            socket.emit(event, data );
            callback(); // tell async that the iterator has completed
        }, function(err) {

        });
    }
    /*
    For future use
    broadcastMessageToEveryone : function (IOsockets, event, data) {
        IOsockets.emit(event, data );
    },
    */
};
