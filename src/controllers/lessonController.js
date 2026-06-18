const db = require('../config/firebase');
const jwt = require('jsonwebtoken');
const Lesson = require('../models/lessonModel');

exports.getAllLessons = async (req, res) => {
    try {
        const lessonSnapshot = await db.collection('lesson').get();
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
        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
            return res.status(404).json({ error: 'Lesson not found' });
        }
        const lesson = new Lesson(
            lessonSnapshot.id,
            lessonSnapshot.data().name,
            lessonSnapshot.data().description,
            lessonSnapshot.data().createdBy,
            lessonSnapshot.data().createdAt,
            lessonSnapshot.data().updatedAt
        );
        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.status(201).json(newLesson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.editLesson = async (req, res) => {
    const lessonId = req.params.id;
    const { name, description } = req.body;
    const user = req.user;

    try {
        const lessonRef = db.collection('lesson').doc(lessonId);
        const lessonSnapshot = await lessonRef.get();

        if (!lessonSnapshot.exists) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        if (lessonSnapshot.data().createdBy !== user.phone) {
            return res
                .status(403)
                .json({
                    error: 'Access denied. You can only edit lessons you created.',
                });
        }

        const updatedAt = new Date();
        await lessonRef.update({ name, description, updatedAt });

        res.status(200).json({
            message: 'Lesson updated successfuly.',
            data: {
                name,
                description,
                updatedAt,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteLesson = async (req, res) => {
    const lessonId = req.params.id;
    const user = req.user;

    try {
        const lessonDoc = await db.collection('lesson').doc(lessonId).get();

        if (!lessonDoc.exists) {
            return res.status(404).json({
                error: 'Lesson not found',
            });
        }

        if (user.role !== 'instructor') {
            return res.status(403).json({
                error: 'Access denied',
            });
        }

        await lessonDoc.ref.update({
            isDeleted: true,
            deletedAt: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: 'Lesson deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
