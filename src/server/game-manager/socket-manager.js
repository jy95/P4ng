module.exports = {
    sendMessage: function (socket, event, message) {
        socket.emit(event, message);
    },

    broadcastMessageInRoomWithoutMe: function (roomId, socket, event, data) {
        socket.broadcast.to('Room' + roomId).emit(event, data );
    },

    broadcastMessageInRoom : function (IOsockets, roomId, event, data) {
        IOsockets.in('Room' + roomId).emit(event, data );
    },

    broadcastMessageToEveryone : function (IOsockets, event, data) {
        IOsockets.emit(event, data );
    },
    
    registerNewPlayerInsideARoom : function (socket,roomId) {
        socket.join('Room' + roomId);
    },
    
    removePlayerFromRoom : function (socket,roomId) {
        socket.leave('Room'+  roomId);
    }
};
