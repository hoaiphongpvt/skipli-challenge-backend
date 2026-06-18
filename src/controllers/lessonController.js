const db = require('../config/firebase');
const jwt = require('jsonwebtoken');
const Lesson = require('../models/lessonModel');
const { success, error } = require('../helpers/apiRespone');

exports.getAllLessons = async (req, res) => {
    try {
        const lessonSnapshot = await db.collection('lesson').get();
        if (lessonSnapshot.empty) return error(res, 404, 'No lessons found');
        const lessons = lessonSnapshot.docs.map(
            (doc) =>
                new Lesson(
                    doc.id,
                    doc.data().name,
                    doc.data().description,
                    doc.data().createdBy,
                    doc.data().createdAt,
                    doc.data().updatedAt
                )
        );
        return success(res, lessons, 200, 'Get lessons successfully');
    } catch (err) {
        return error(res, 500, 'Internal server error', err, message);
    }
};

exports.getLessonById = async (req, res) => {
    const lessonId = req.params.id;
    try {
        const lessonSnapshot = await db
            .collection('lesson')
            .doc(lessonId)
            .get();
        if (!lessonSnapshot.exists) {
            return error(res, 404, 'Lesson not found');
        }

        const lesson = new Lesson(
            lessonSnapshot.id,
            lessonSnapshot.data().name,
            lessonSnapshot.data().description,
            lessonSnapshot.data().createdBy,
            lessonSnapshot.data().createdAt,
            lessonSnapshot.data().updatedAt
        );
        return success(res, lesson, 200, 'Get lesson successfully');
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};

exports.createLesson = async (req, res) => {
    const { name, description } = req.body;
    const user = req.user;

    try {
        const newLessonRef = await db.collection('lesson').add({
            name,
            description,
            createdBy: user.phone,
            createdAt: new Date(),
        });
        const newLessonSnapshot = await newLessonRef.get();
        const newLesson = new Lesson(
            newLessonSnapshot.id,
            newLessonSnapshot.data().name,
            newLessonSnapshot.data().description,
            newLessonSnapshot.data().createdBy,
            newLessonSnapshot.data().createdAt
        );
        return success(res, newLesson, 201, 'Lesson created successfully');
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};

exports.editLesson = async (req, res) => {
    const lessonId = req.params.id;
    const { name, description } = req.body;
    const user = req.user;

    try {
        const lessonDoc = await db.collection('lesson').doc(lessonId).get();

        if (!lessonDoc.exists) {
            return error(res, 404, 'Lesson not found');
        }

        const lesson = lessonDoc.data();

        if (lesson.isDeleted) {
            return error(res, 404, 'Lesson not found');
        }

        if (lesson.createdBy !== user.phone) {
            return error(
                res,
                403,
                'Access denied. You can only edit lessons you created.'
            );
        }

        const updatedAt = new Date();

        await lessonDoc.ref.update({
            name,
            description,
            updatedAt,
        });

        const updatedLessonDoc = await lessonDoc.ref.get();

        return success(
            res,
            {
                id: updatedLessonDoc.id,
                ...updatedLessonDoc.data(),
            },
            200,
            'Lesson updated successfully.'
        );
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};

exports.deleteLesson = async (req, res) => {
    const lessonId = req.params.id;
    const user = req.user;

    try {
        const lessonDoc = await db.collection('lesson').doc(lessonId).get();

        if (!lessonDoc.exists) {
            return error(res, 404, 'Lesson not found');
        }

        if (user.role !== 'instructor') {
            return error(res, 403, 'Access denied');
        }

        await lessonDoc.ref.update({
            isDeleted: true,
            deletedAt: new Date(),
        });

        return success(res, null, 200, 'Lesson deleted successfully');
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};

exports.assignLesson = async (req, res) => {
    const { lessonId, studentPhone, title, description } = req.body;
    const user = req.user;

    try {
        const lessonDoc = await db.collection('lesson').doc(lessonId).get();
        if (!lessonDoc.exists) {
            return error(res, 404, 'Lesson not found');
        }

        const studentSnapshot = await db
            .collection('user')
            .where('phone', '==', studentPhone)
            .where('role', '==', 'student')
            .limit(1)
            .get();
        if (studentSnapshot.empty) {
            return error(res, 404, 'Student not found');
        }

        const existingAssignment = await db
            .collection('lesson_assignment')
            .where('lessonId', '==', lessonId)
            .where('studentPhone', '==', studentPhone)
            .get();
        if (!existingAssignment.empty) {
            return error(res, 409, 'Lesson already assigned');
        }

        const assignmentRef = await db.collection('lesson_assignment').add({
            lessonId,
            studentPhone,
            assignedBy: user.phone,
            assignedAt: new Date(),
            completed: false,
            completedAt: null,
        });

        return success(
            res,
            {
                id: assignmentRef.id,
                lessonId,
                studentPhone,
            },
            201,
            'Lesson assigned successfully'
        );
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};
