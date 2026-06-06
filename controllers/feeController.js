const pool = require('../config/db');
const generateId = require('../utils/generateId');

exports.getFees = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT f.fee_id, f.student_id, s.first_name AS student_first, s.last_name AS student_last, 
             f.amount, f.fee_type, f.due_date, f.status
      FROM Fee f JOIN Student s ON f.student_id = s.student_id
    `);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.createFee = async (req, res) => {
  const { student_id, amount, fee_type, due_date, status } = req.body;
  try {
    const fee_id = await generateId('FEE', 'Fee', 'fee_id');
    const result = await pool.query(
      'INSERT INTO Fee (fee_id, student_id, amount, fee_type, due_date, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [fee_id, student_id, amount, fee_type, due_date, status || 'Unpaid']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

exports.updateFee = async (req, res) => {
  const { amount, fee_type, due_date, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Fee SET amount=$1, fee_type=$2, due_date=$3, status=$4 WHERE fee_id=$5 RETURNING *',
      [amount, fee_type, due_date, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.deleteFee = async (req, res) => {
  try {
    await pool.query('DELETE FROM Fee WHERE fee_id=$1', [req.params.id]);
    res.json({ message: 'Fee deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};