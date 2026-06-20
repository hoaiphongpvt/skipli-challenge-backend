const { db } = require('../config/firebase');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Connected:', socket.id);

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
        });

        socket.on('send-message', async (data) => {
            const {
                roomId,
                senderPhone,
                message,
            } = data;

            const messageRef = await db
                .collection('chat_messages')
                .add({
                    roomId,
                    senderPhone,
                    message,
                    isRead: false,
                    createdAt: new Date(),
                });

            io.to(roomId).emit('receive-message', {
                id: messageRef.id,
                roomId,
                senderPhone,
                message,
                createdAt: new Date(),
            });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected');
        });
    });
};