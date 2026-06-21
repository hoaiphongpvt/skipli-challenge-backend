const db = require('../config/firebase');
const Student = require('../models/userModel');
const { sendStudentInvitationEmail } = require('../services/emailService');
const { success, error } = require('../helpers/apiRespone');
const Lesson = require('../models/lessonModel');

exports.getStudentByPhone = async function (req, res) {
    const phone = req.params.phone;
    try {
        const studentSnapshot = await db
            .collection('user')
            .where('phone', '==', phone)
            .limit(1)
            .get();

        if (studentSnapshot.empty) {
            return error(res, 404, 'Student not found with this phone!');
        }

        const student = studentSnapshot.docs[0].data();

        return success(res, student, 200, 'Get student successfully');
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};

exports.getAllStudents = async function (req, res) {
    try {
        const studentSnapshot = await db
            .collection('user')
            .where('role', '==', 'student')
            .where('isDeleted', '==', false)
            .orderBy('createdAt', 'desc')
            .get();

        if (studentSnapshot.empty) {
            return error(res, 404, 'No students found!');
        }
        const students = studentSnapshot.docs.map(
            (doc) =>
                new Student(
                    doc.id,
                    doc.data().name,
                    doc.data().email,
                    doc.data().phone,
                    doc.data().role,
                    doc.data().createdAt
                )
        );
        return success(
            res,
            { total: students.length, students },
            200,
            'Get students list successfully'
        );
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};

exports.createStudent = async function (req, res) {
    const { name, email, phone, role } = req.body;
    try {
        const existingStudentRef = db
            .collection('user')
            .where('phone', '==', phone)
            .limit(1);
        const snapshot = await existingStudentRef.get();

        if (!snapshot.empty) {
            return error(
                res,
                400,
                'Student with this phone number already exists'
            );
        }

        const newStudentRef = await db.collection('user').add({
            name,
            email,
            phone,
            role,
            isDeleted: false,
            createdAt: new Date(),
        });

        if (newStudentRef) {
            await sendStudentInvitationEmail(
                email,
                name,
                'http://localhost:3000/invite'
            );
        }
        const studentDoc = await newStudentRef.get();
        return success(
            res,
            studentDoc.data(),
            201,
            'Created student successfully'
        );
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};

exports.editStudent = async function (req, res) {
    const phone = req.params.phone;
    const { name, email, role } = req.body;
    try {
        const studentRef = db
            .collection('user')
            .where('phone', '==', phone)
            .limit(1);
        const snapshot = await studentRef.get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await doc.ref.update({ name, email, role, updatedAt: new Date() });
            const updatedStudent = {
                id: doc.id,
                ...doc.data(),
                name,
                email,
                role,
                updatedAt: new Date(),
            };
            return success(
                res,
                updatedStudent,
                200,
                'Updated student successfully'
            );
        } else {
            return error(res, 404, 'Student not found');
        }
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};

exports.deleteStudent = async function (req, res) {
    const phone = req.params.phone;
    try {
        const studentRef = db
            .collection('user')
            .where('phone', '==', phone)
            .limit(1);
        const snapshot = await studentRef.get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await doc.ref.update({ deletedAt: new Date(), isDeleted: true });
            return success(res, null, 200, 'Deleted student successfully');
        } else {
            return error(res, 404, 'Student not found');
        }
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};

exports.getMyLessons = async (req, res) => {
    const { phone } = req.query;
    const user = req.user;

    try {
        if (phone !== user.phone) {
            return error(res, 403, 'Access denied');
        }

        const assignmentSnapshot = await db
            .collection('lesson_assignment')
            .where('studentPhone', '==', phone)
            .get();

        if (assignmentSnapshot.empty) {
            return error(res, 404, 'No assignments found');
        }

        const assignments = assignmentSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        const lessons = await Promise.all(
            assignments.map(async (assignment) => {
                const lessonDoc = await db
                    .collection('lesson')
                    .doc(assignment.lessonId)
                    .get();

                if (!lessonDoc.exists) {
                    return null;
                }

                return {
                    assignmentId: assignment.id,
                    completed: assignment.completed,
                    completedAt: assignment.completedAt,
                    assignedAt: assignment.assignedAt,
                    lesson: {
                        id: lessonDoc.id,
                        ...lessonDoc.data(),
                    },
                };
            })
        );

        return success(
            res,
            {
                total: lessons.filter(Boolean).length,
                items: lessons.filter(Boolean),
            },
            200,
            'Get my lessons successfully'
        );
    } catch (err) {
        return error(res, 500, 'Internal server error', err.message);
    }
};

exports.makeLessonDone = async (req, res) => {
    const { lessonId } = req.params;
    const user = req.user;

    try {
        const assignmentSnapshot = await db
            .collection('lesson_assignment')
            .where('lessonId', '==', lessonId)
            .where('studentPhone', '==', user.phone)
            .limit(1)
            .get();

        if (assignmentSnapshot.empty) {
            return error(res, 404, 'No lesson assignment found');
        }

        const assignmentDoc = assignmentSnapshot.docs[0];
        const assignmentData = assignmentDoc.data();

        if (assignmentData.completed) {
            return error(res, 400, 'Lesson already completed');
        }

        await assignmentDoc.ref.update({
            completed: true,
            completedAt: new Date(),
        });

        const updatedDoc = await assignmentDoc.ref.get();

        return success(
            res,
            {
                id: updatedDoc.id,
                ...updatedDoc.data(),
            },
            200,
            'Lesson marked as completed successfully'
        );
    } catch (err) {
        error(res, 500, 'Internal server error', err.message);
    }
};
