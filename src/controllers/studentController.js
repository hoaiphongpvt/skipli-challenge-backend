const db = require("../config/firebase");
const Student = require("../models/userModel");
const { sendStudentInvitationEmail } = require("../services/emailService");

exports.getStudentByPhone = async function(req, res) {
  const phone = req.params.phone;
  try {
    const studentRef = db.collection('student').where('phone', '==', phone).limit(1);
    const snapshot = await studentRef.get();
        if (snapshot.empty) {
          res.status(404).json({ error: 'Student not found' });
        } else {
          const doc = snapshot.docs[0];
          res.status(200).json(new Student(doc.id, doc.data().name, doc.data().email, doc.data().phone));
        }
      }
    catch (error) {
    res.status(500).json({ error: error.message });
    }  
} 

exports.getAllStudents = async function(req, res) {
 try {
    const snapshot = await db.collection('student').get();
    const students = snapshot.docs.map(doc => new Student(doc.id, doc.data().name, doc.data().email, doc.data().phone));
    console.log(students);
    res.status(200).json(students);
  }
    catch (error) {
    res.status(500).json({ error: error.message });
    }
}

exports.createStudent = async function(req, res) {
  const { name, email, phone } = req.body;
  try {
    const existingStudentRef = db.collection('user').where('phone', '==', phone).limit(1);
    const snapshot = await existingStudentRef.get();

    if (!snapshot.empty) {
      return res.status(400).json({ error: 'Student with this phone number already exists' });
    }

    const newStudentRef = await db.collection('user').add({ name, email, phone, role: 'student', createdAt: new Date() });
    if (newStudentRef) {
      await sendStudentInvitationEmail(email, name, 'http://localhost:3000/invite');
    }
    res.status(201).json({ id: newStudentRef.id, name, email, phone, role: 'student', createdAt: new Date() });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.editStudent = async function(req, res) {
  const phone = req.params.phone;
  const { name, email } = req.body;

  try {
    const studentRef = db.collection('user').where('phone', '==', phone).limit(1);
    const snapshot = await studentRef.get();

    if (snapshot.empty) {
      res.status(404).json({ error: 'Student not found' });
    }
    else {
      const doc = snapshot.docs[0];
      await doc.ref.update({ name, email, updatedAt: new Date() });
      res.status(200).json({ id: doc.id, name, email, phone });
    }
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.deleteStudent = async function(req, res) {
  const phone = req.params.phone;
  try {
    const studentRef = db.collection('user').where('phone', '==', phone).limit(1);
    const snapshot = await studentRef.get();  
    if (snapshot.empty) {
      res.status(404).json({ error: 'Student not found' });
    }
    else {
      const doc = snapshot.docs[0];
      await doc.ref.update({ deletedAt: new Date(), isDeleted: true });
      res.status(200).json({ message: 'Student deleted successfully' });
    } 
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  } 
}