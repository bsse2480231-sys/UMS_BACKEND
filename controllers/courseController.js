const pool = require('../config/db');
const generateId = require('../utils/generateId')

exports.getCourses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Course');
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.createCourse = async (req, res) => {
  const { course_code, course_name, credits, description, course_type, program_id } = req.body;
  try {
    const course_id = await generateId('CRS', 'Course', 'course_id');
    const result = await pool.query(
      'INSERT INTO Course (course_id, course_code, course_name, credits, description, course_type, program_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [course_id, course_code, course_name, credits, description, course_type, program_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { console.log(error), res.status(500).json({ message: 'Server error', error: error.message }); }
};

exports.updateCourse = async (req, res) => {
  const { course_code, course_name, credits, description, course_type, program_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Course SET course_code=$1, course_name=$2, credits=$3, description=$4, course_type=$5, program_id=$6 WHERE course_id=$7 RETURNING *',
      [course_code, course_name, credits, description, course_type, program_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.deleteCourse = async (req, res) => {
  try {
    await pool.query('DELETE FROM Course WHERE course_id=$1', [req.params.id]);
    res.json({ message: 'Course deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};