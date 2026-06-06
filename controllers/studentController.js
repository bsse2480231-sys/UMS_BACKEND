const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const generateId = require('../utils/generateId')

exports.getStudents = async (req, res) => {
  try {
    const result = await pool.query('SELECT s.student_id, s.first_name, s.phone,s.last_name, u.email, s.current_semester, s.status FROM Student s JOIN "User" u ON s.user_id = u.user_id');
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.createStudent = async (req, res) => {
  // const { student_id, first_name, last_name, email, password, phone, current_semester, program_id } = req.body;
  const { first_name, last_name, email, password, phone, current_semester, program_id } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userId = await generateId('USR', '"User"', 'user_id');       // USR003
    const studentId = await generateId('STU', 'Student', 'student_id'); // STU003
    // Create User First

    // const userRes = await pool.query(
    //   `INSERT INTO "User" (user_id, email, password_hash, role, is_verified) VALUES ($1, $2, $3, 'Student', TRUE) RETURNING user_id`,
    //   [`USR-${student_id}`, email, password_hash]
    // );
    // const userId = userRes.rows[0].user_id;

    // // Create Student Profile
    // const result = await pool.query(
    //   `INSERT INTO Student (student_id, user_id, first_name, last_name, phone, current_semester, program_id) 
    //    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    //   [student_id, userId, first_name, last_name, phone, current_semester, program_id]
    // );
    await pool.query(
      `INSERT INTO "User" (user_id, email, password_hash, role, is_verified) VALUES ($1, $2, $3, 'Student', TRUE)`,
      [userId, email, password_hash]
    );

    // Create Student
    const result = await pool.query(
      `INSERT INTO Student (student_id, user_id, first_name, last_name, phone, current_semester, program_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [studentId, userId, first_name, last_name, phone, current_semester, program_id] // Use generated studentId
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error),
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateStudent = async (req, res) => {
  const { first_name, last_name, phone, current_semester, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Student SET first_name=$1, last_name=$2, phone=$3, current_semester=$4, status=$5 WHERE student_id=$6 RETURNING *`,
      [first_name, last_name, phone, current_semester, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await pool.query('SELECT user_id FROM Student WHERE student_id=$1', [req.params.id]);
    if (student.rows.length === 0) return res.status(404).json({ message: 'Not found' });

    // Deleting User cascades to Student because of ON DELETE CASCADE
    await pool.query('DELETE FROM "User" WHERE user_id=$1', [student.rows[0].user_id]);
    res.json({ message: 'Student deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};