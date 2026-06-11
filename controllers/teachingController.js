const pool = require('../config/db')
const generateId = require('../utils/generateId');

exports.getTeachings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.teaching_id, t.semester, t.section, 
             i.instructor_id, i.first_name AS inst_first, i.last_name AS inst_last,
             c.course_id, c.course_code, c.course_name,
             cl.classroom_id, cl.room_number
      FROM Teaching t
      JOIN Instructor i ON t.instructor_id = i.instructor_id
      JOIN Course c ON t.course_id = c.course_id
      JOIN Classroom cl ON t.classroom_id = cl.classroom_id
    `);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

// Assign course to instructor
exports.assignCourse = async (req, res) => {
  const { instructor_id, course_id, semester, section, classroom_id } = req.body;
  try {
    const teaching_id = await generateId('TEACH', 'Teaching', 'teaching_id');
    
    const result = await pool.query(
      `INSERT INTO Teaching (teaching_id, instructor_id, course_id, semester, section, classroom_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [teaching_id, instructor_id, course_id, semester, section, classroom_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

// Unassign (Delete)
exports.deleteTeaching = async (req, res) => {
  try {
    await pool.query('DELETE FROM Teaching WHERE teaching_id=$1', [req.params.id]);
    res.json({ message: 'Assignment removed' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};