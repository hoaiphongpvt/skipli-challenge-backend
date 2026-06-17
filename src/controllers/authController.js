const twilioClient = require('../config/twilio');
const db = require('../config/firebase');
const jwt = require('jsonwebtoken');
const formatVietnamPhone = require('../utils/formatPhoneNumber');

exports.sendOTP = async (req, res) => {
    const { phone } = req.body;

    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    try {
        const snapshot = await db
            .collection("otp")
            .where("phone", "==", phone)
            .limit(1)
            .get();

        const data = {
            phone,
            otp,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        };

        if (snapshot.empty) {
            await db.collection("otp").add(data);
        } else {
            const docId = snapshot.docs[0].id;

            await db
                .collection("otp")
                .doc(docId)
                .update(data);
        }

        console.log(`OTP for ${phone}: ${otp}`);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error("Error sending OTP:", error);

        return res.status(500).json({
            error: "Failed to send OTP"
        });
    }
};

exports.verifyOTP = async (req, res) => {
    const { phone, otp } = req.body;

    try {
        const snapshot = await db
            .collection("otp")
            .where("phone", "==", phone)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(400).json({
                error: "No OTP found for this phone number"
            });
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        if (data.otp !== otp) {
            return res.status(400).json({
                error: "Invalid OTP"
            });
        } else if (data.expiresAt.toDate() < new Date()) {
            return res.status(400).json({
                error: "OTP has expired"
            });
        } else {
            await db.collection("otp").doc(doc.id).delete();
        }

        const phoneNumber = data.phone;
        const userSnapshot = await db.collection("user").where("phone", "==", phoneNumber).limit(1).get();

        const token = jwt.sign({
            phone: phoneNumber,
            role: userSnapshot.empty ? "guest" : userSnapshot.docs[0].data().role,
        }, process.env.JWT_SECRET, { 
            expiresIn: process.env.JWT_EXPIRES_IN
        })
    
        return res.status(200).json({
            success: true,
            user: userSnapshot.empty ? null : userSnapshot.docs[0].data(),
            token
        });
       

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({
            error: "Failed to verify OTP"
        });
    }
};
