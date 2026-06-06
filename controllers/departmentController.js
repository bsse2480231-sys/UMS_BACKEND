const pool = require('../config/db');
const generateId = require('../utils/generateId');

exports.getDepartments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Department');
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.createDepartment = async (req, res) => {
  const { department_name, department_code, established_year, head_of_department } = req.body;
  try {
    const department_id = await generateId('DEPT', 'Department', 'department_id');
    const result = await pool.query(
      'INSERT INTO Department (department_id, department_name, department_code, established_year, head_of_department) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [department_id, department_name, department_code, established_year, head_of_department]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

exports.updateDepartment = async (req, res) => {
  const { department_name, department_code, established_year, head_of_department } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Department SET department_name=$1, department_code=$2, established_year=$3, head_of_department=$4 WHERE department_id=$5 RETURNING *',
      [department_name, department_code, established_year, head_of_department, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await pool.query('DELETE FROM Department WHERE department_id=$1', [req.params.id]);
    res.json({ message: 'Department deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};