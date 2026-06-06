const pool = require('../config/db');
const generateId = require('../utils/generateId');

// Get all programs (Join with Department to show Dept Name)
exports.getPrograms = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.program_id, p.program_name, p.degree_level, p.duration_semesters, p.total_credits, 
             p.department_id, d.department_name
      FROM Program p
      JOIN Department d ON p.department_id = d.department_id
    `);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

// Create Program (Auto-generate ID)
exports.createProgram = async (req, res) => {
  const { program_name, degree_level, duration_semesters, total_credits, department_id } = req.body;
  try {
    const program_id = await generateId('PROG', 'Program', 'program_id'); // AUTO ID
    
    const result = await pool.query(
      `INSERT INTO Program (program_id, program_name, degree_level, duration_semesters, total_credits, department_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [program_id, program_name, degree_level, duration_semesters, total_credits, department_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

// Update Program
exports.updateProgram = async (req, res) => {
  const { program_name, degree_level, duration_semesters, total_credits, department_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Program SET program_name=$1, degree_level=$2, duration_semesters=$3, total_credits=$4, department_id=$5 
       WHERE program_id=$6 RETURNING *`,
      [program_name, degree_level, duration_semesters, total_credits, department_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

// Delete Program
exports.deleteProgram = async (req, res) => {
  try {
    await pool.query('DELETE FROM Program WHERE program_id=$1', [req.params.id]);
    res.json({ message: 'Program deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};