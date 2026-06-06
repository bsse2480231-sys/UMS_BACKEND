const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Get all admins
exports.getAdmins = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT a.admin_id, a.first_name, a.last_name, u.email, a.role, a.department_id FROM Admin a JOIN "User" u ON a.user_id = u.user_id'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single admin
exports.getAdminById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT a.admin_id, a.first_name, a.last_name, u.email, a.role, a.department_id FROM Admin a JOIN "User" u ON a.user_id = u.user_id WHERE a.admin_id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Admin not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create admin
exports.createAdmin = async (req, res) => {
  const { admin_id, first_name, last_name, email, password, role, department_id } = req.body;
  try {
    // 1. Hash Password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 2. Create Auth User Record
    const userRes = await pool.query(
      `INSERT INTO "User" (user_id, email, password_hash, role, is_verified) VALUES ($1, $2, $3, 'Admin', TRUE) RETURNING user_id`,
      [`USR-${admin_id}`, email, password_hash]
    );
    const userId = userRes.rows[0].user_id;

    // 3. Create Admin Profile
    const result = await pool.query(
      `INSERT INTO Admin (admin_id, user_id, first_name, last_name, role, department_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING admin_id, first_name, last_name, role`,
      [admin_id, userId, first_name, last_name, role || 'Admin', department_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update admin
exports.updateAdmin = async (req, res) => {
  const { first_name, last_name, role, department_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Admin SET first_name = $1, last_name = $2, role = $3, department_id = $4 
       WHERE admin_id = $5 RETURNING admin_id, first_name, last_name, role`,
      [first_name, last_name, role, department_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Admin not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    // Find the user_id linked to this admin
    const admin = await pool.query('SELECT user_id FROM Admin WHERE admin_id = $1', [req.params.id]);
    if (admin.rows.length === 0) return res.status(404).json({ message: 'Admin not found' });
    
    // Deleting the User will CASCADE and delete the Admin profile automatically
    await pool.query('DELETE FROM "User" WHERE user_id = $1', [admin.rows[0].user_id]);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};