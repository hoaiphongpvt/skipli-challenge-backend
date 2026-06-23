const twilioClient = require('../config/twilio');
const db = require('../config/firebase');
const jwt = require('jsonwebtoken');
const formatVietnamPhone = require('../helpers/formatPhoneNumber');
const { success, error } = require('../helpers/apiRespone');
const { sendSMS } = require('../services/smsService');

exports.sendOTP = async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const existPhone = await db
            .collection('user')
            .where('phone', '==', phone)
            .where('isDeleted', '==', false)
            .limit(1)
            .get();
        if (existPhone.empty) {
            return error(
                res,
                404,
                'There is no account for phone number: ' + phone
            );
        }
        //sendSMS();
        const snapshot = await db
            .collection('otp')
            .where('phone', '==', phone)
            .limit(1)
            .get();

        const data = {
            phone,
            otp,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        };

        if (snapshot.empty) {
            await db.collection('otp').add(data);
        } else {
            const docId = snapshot.docs[0].id;
            await db.collection('otp').doc(docId).update(data);
        }

        console.log(`OTP for ${phone}: ${otp}`);

        return success(res, null, 200, 'OTP sent successfully');
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};

exports.verifyOTP = async (req, res) => {
    const { phone, otp } = req.body;
    try {
        const snapshot = await db
            .collection('otp')
            .where('phone', '==', phone)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return error(res, 400, 'Invalid phone number');
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        if (data.otp !== otp) {
            return error(res, 403, 'Invalid OTP');
        } else if (data.expiresAt.toDate() < new Date()) {
            return error(res, 403, 'OTP has expired');
        } else {
            await db.collection('otp').doc(doc.id).delete();
        }

        const phoneNumber = data.phone;
        const userSnapshot = await db
            .collection('user')
            .where('phone', '==', phoneNumber)
            .limit(1)
            .get();

        const token = jwt.sign(
            {
                phone: phoneNumber,
                role: userSnapshot.docs[0].data().role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN,
            }
        );

        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });

        return success(
            res,
            { user: userSnapshot.docs[0].data() },
            200,
            'Login successfully'
        );
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};
