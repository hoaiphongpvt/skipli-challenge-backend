const db = require("../config/firebase");
const Student = require("../models/userModel");

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
