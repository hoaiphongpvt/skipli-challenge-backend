const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/authMiddleware');
const { isInstructor } = require('../middlewares/isInstructorMiddleware');

const studentController = require('../controllers/studentController');

router.get('/myLessons', auth, studentController.getMyLessons);
router.get('/', studentController.getAllStudents);
router.get('/:phone', studentController.getStudentByPhone);
router.post('/', auth, isInstructor, studentController.createStudent);
router.put('/:phone', auth, isInstructor, studentController.editStudent);
router.delete('/:phone', auth, isInstructor, studentController.deleteStudent);
router.post(
    '/markLessonDone/:lessonId',
    auth,
    studentController.makeLessonDone
);

module.exports = router;
