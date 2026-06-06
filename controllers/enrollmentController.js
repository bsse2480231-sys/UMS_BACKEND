const pool = require('../config/db');
const generateId = require('../utils/generateId');

exports.getEnrollments = async (req, res) => {
  try {
    // Joining to get student name and course name for a cleaner UI
    const result = await pool.query(`
      SELECT e.enrollment_id, e.student_id, s.first_name AS student_first, s.last_name AS student_last, 
             e.course_id, c.course_name, e.semester, e.grade, e.status
      FROM Enrollment e
      JOIN Student s ON e.student_id = s.student_id
      JOIN Course c ON e.course_id = c.course_id
    `);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

exports.createEnrollment = async (req, res) => {
  const { student_id, course_id, semester, grade, status } = req.body;
  try {
    const enrollment_id = await generateId('ENR', 'Enrollment', 'enrollment_id');
    const result = await pool.query(
      'INSERT INTO Enrollment (enrollment_id, student_id, course_id, semester, grade, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [enrollment_id, student_id, course_id, semester, grade || null, status || 'Enrolled']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

exports.updateEnrollment = async (req, res) => {
  const { semester, grade, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Enrollment SET semester=$1, grade=$2, status=$3 WHERE enrollment_id=$4 RETURNING *',
      [semester, grade, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    await pool.query('DELETE FROM Enrollment WHERE enrollment_id=$1', [req.params.id]);
    res.json({ message: 'Enrollment deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};