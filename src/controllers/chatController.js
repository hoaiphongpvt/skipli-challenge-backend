const db = require('../config/firebase');
const { success } = require('../helpers/apiRespone');

exports.createRoomChat = async (req, res) => {
    const { studentPhone, instructorPhone } = req.body;
    try {
        const existingRoom = await db
            .collection('chat_room')
            .where('studentPhone', '==', studentPhone)
            .where('instructorPhone', '==', instructorPhone)
            .limit(1)
            .get();
        if (!existingRoom.empty) {
            return success(
                res,
                { roomId: existingRoom.docs[0].id },
                200,
                'Room chat already exist'
            );
        }

        const roomRef = await db.collection('chat_room').add({
            studentPhone,
            instructorPhone,
            createdAt: new Date(),
        });

        return success(
            res,
            {
                roomId: roomRef.id,
            },
            201,
            'Room chat created successfully'
        );
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};
