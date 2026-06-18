require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require(process.env.FIREBASE_ADMIN_SDK);

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

module.exports = db;
