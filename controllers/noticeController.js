const pool = require('../config/db');
const generateId = require('../utils/generateId');

// exports.getNotices = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM Notice ORDER BY posted_date DESC');
//     res.json(result.rows);
//   } catch (error) { res.status(500).json({ message: 'Server error' }); }
// };

exports.getNotices = async (req, res) => {
  try {
    let query = 'SELECT * FROM Notice';
    const params = [];

    // If the user is not an Admin, filter by their role or 'All'
    if (req.user && req.user.role !== 'Admin') {
      const role = req.user.role; // 'Student' or 'Instructor'
      query += ' WHERE target_audience = $1 OR target_audience = $2';
      params.push(role, 'All');
    }

    query += ' ORDER BY posted_date DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createNotice = async (req, res) => {
  const { title, content, target_audience } = req.body;
  try {
    const notice_id = await generateId('NOT', 'Notice', 'notice_id');

    const result = await pool.query(
      'INSERT INTO Notice (notice_id, title, content, target_audience, posted_date) VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *',
      [notice_id, title, content, target_audience]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

exports.deleteNotice = async (req, res) => {
  try {
    await pool.query('DELETE FROM Notice WHERE notice_id=$1', [req.params.id]);
    res.json({ message: 'Notice deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};