const pool = require('../config/db');
const generateId = require('../utils/generateId');

exports.getExams = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.exam_id, e.course_id, c.course_name, e.exam_type, e.exam_date, e.total_marks, e.classroom_id
      FROM Exam e JOIN Course c ON e.course_id = c.course_id
    `);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.createExam = async (req, res) => {
  const { course_id, exam_type, exam_date, total_marks, classroom_id } = req.body;
  try {
    const exam_id = await generateId('EXM', 'Exam', 'exam_id');
    const result = await pool.query(
      'INSERT INTO Exam (exam_id, course_id, exam_type, exam_date, total_marks, classroom_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [exam_id, course_id, exam_type, exam_date, total_marks, classroom_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

exports.updateExam = async (req, res) => {
  const { exam_type, exam_date, total_marks, classroom_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Exam SET exam_type=$1, exam_date=$2, total_marks=$3, classroom_id=$4 WHERE exam_id=$5 RETURNING *',
      [exam_type, exam_date, total_marks, classroom_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.deleteExam = async (req, res) => {
  try {
    await pool.query('DELETE FROM Exam WHERE exam_id=$1', [req.params.id]);
    res.json({ message: 'Exam deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};