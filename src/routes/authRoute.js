const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.post('/send-code', authController.sendOTP);
router.post('/verify-code', authController.verifyOTP);


module.exports = router;