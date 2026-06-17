const db = require("../config/firebase");
const Student = require("../models/studentModel");

exports.getStudentById = function(id) {
  return new Promise((resolve, reject) => {
    const studentRef = db.collection('students').doc(id);  
    studentRef.get()
      .then(doc => {
        if (!doc.exists) {
          reject(new Error('Student not found'));
        } else {
          resolve(new Student(doc.id, doc.data().name, doc.data().email, doc.data().phone));
        }
      })
      .catch(err => {
        reject(err);
      });
  });
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
