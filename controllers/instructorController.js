const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const generateId = require('../utils/generateId');

exports.getInstructors = async (req, res) => {
  try {
    const result = await pool.query('SELECT i.instructor_id, i.first_name,i.designation, i.last_name, u.email, i.specialization FROM Instructor i JOIN "User" u ON i.user_id = u.user_id');
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.createInstructor = async (req, res) => {
  const { first_name, last_name, email, password, specialization, designation, department_id } = req.body;
  try {
    const userId = await generateId('USR', '"User"', 'user_id');       // USR003
    const instructor_id = await generateId('INS', 'Instructor', 'instructor_id');

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // const userRes = await pool.query(
    //   `INSERT INTO "User" (user_id, email, password_hash, role, is_verified) VALUES ($1, $2, $3, 'Instructor', TRUE) RETURNING user_id`,
    //   [`USR-${instructor_id}`, email, password_hash]
    // );
    await pool.query(
      `INSERT INTO "User" (user_id, email, password_hash, role, is_verified) VALUES ($1, $2, $3, 'Student', TRUE)`,
      [userId, email, password_hash]
    );

    // const userId = userRes.rows[0].user_id;

    const result = await pool.query(
      `INSERT INTO Instructor (instructor_id, user_id, first_name, last_name, specialization, designation, department_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [instructor_id, userId, first_name, last_name, specialization, designation, department_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

exports.updateInstructor = async (req, res) => {
  const { first_name, last_name, specialization, designation } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Instructor SET first_name=$1, last_name=$2, specialization=$3, designation=$4 WHERE instructor_id=$5 RETURNING *`,
      [first_name, last_name, specialization, designation, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.deleteInstructor = async (req, res) => {
  try {
    const inst = await pool.query('SELECT user_id FROM Instructor WHERE instructor_id=$1', [req.params.id]);
    if (inst.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    await pool.query('DELETE FROM "User" WHERE user_id=$1', [inst.rows[0].user_id]);
    res.json({ message: 'Instructor deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};


exports.getCourseStudents = async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user.profileId; // From JWT

  try {
    // Verify this instructor actually teaches this course
    const teachCheck = await pool.query(
      'SELECT * FROM Teaching WHERE course_id = $1 AND instructor_id = $2',
      [courseId, instructorId]
    );
    if (teachCheck.rows.length === 0) {
      return res.status(403).json({ message: 'You do not teach this course' });
    }

    const result = await pool.query(`
      SELECT e.enrollment_id, e.student_id, s.first_name, s.last_name, e.grade, e.status
      FROM Enrollment e JOIN Student s ON e.student_id = s.student_id
      WHERE e.course_id = $1
    `, [courseId]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Submit attendance for a course

// @desc    Submit attendance for a course
exports.submitAttendance = async (req, res) => {
  const { courseId, date, records } = req.body; 

  try {
    // Safety check: ensure we have the required data
    if (!courseId || !date || !records || records.length === 0) {
      return res.status(400).json({ message: 'Missing course, date, or student records' });
    }

    // Insert all records
    for (const rec of records) {
      const attId = await generateId('ATT', 'Attendance', 'attendance_id'); // Safely generates ATT001, ATT002, etc.
      
      await pool.query(
        `INSERT INTO Attendance (attendance_id, student_id, course_id, date, status) 
         VALUES ($1, $2, $3, $4, $5)`,
        [attId, rec.student_id, courseId, date, rec.status]
      );
    }
    
    res.status(201).json({ message: 'Attendance submitted successfully' });
  } catch (error) {
    console.error('ATTENDANCE ERROR:', error); // This will show the EXACT error in your terminal
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// @desc    Submit/Update grades for a course
exports.submitGrades = async (req, res) => {
  const { records } = req.body; // records = [{ enrollment_id, grade }]

  try {
    for (const rec of records) {
      await pool.query(
        `UPDATE Enrollment SET grade = $1 WHERE enrollment_id = $2`,
        [rec.grade, rec.enrollment_id]
      );
    }
    res.json({ message: 'Grades updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};