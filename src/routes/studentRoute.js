const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');

router.get('/', studentController.getAllStudents);
router.get('/:phone', studentController.getStudentByPhone);

module.exports = router;