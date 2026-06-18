const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/authMiddleware');
const { isInstructor } = require('../middlewares/isInstructorMiddleware');

const lessonController = require('../controllers/lessonController');

router.get('/', auth, isInstructor, lessonController.getAllLessons);
router.get('/:id', auth, lessonController.getLessonById);
router.post('/', auth, isInstructor, lessonController.createLesson);
router.put('/:id', auth, isInstructor, lessonController.editLesson);
router.delete('/:id', auth, isInstructor, lessonController.deleteLesson);

module.exports = router;
