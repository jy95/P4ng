module.exports = {
    sendMessage: function (socket, event, message) {
        socket.emit(event, JSON.stringify(message));
    },

    broadcastMessageInRoomWithoutMe: function (roomId, socket, event, data) {
        socket.broadcast.to('Room' + roomId).emit(event, JSON.stringify(data) );
    },

    broadcastMessageInRoom : function (IOsockets, roomId, event, data) {
        IOsockets.in('Room' + roomId).emit(event, JSON.stringify(data) );
    },

    broadcastMessageToEveryone : function (IOsockets, event, data) {
        IOsockets.emit(event, JSON.stringify(data) );
    },
    
    registerNewPlayerInsideARoom : function (socket,roomId) {
        socket.join('Room' + roomId);
    },
    
    removePlayerFromRoom : function (socket,roomId) {
        socket.leave('Room'+  roomId);
    }
};
