const pool = require('../config/db');

/**
 * Generates an auto-incremented ID
 * @param {string} prefix - e.g., 'STU', 'DEPT', 'CRS'
 * @param {string} tableName - e.g., 'Student', 'Department'
 * @param {string} columnName - e.g., 'student_id', 'department_id'
 * @returns {string} New ID like STU003
 */
const generateId = async (prefix, tableName, columnName) => {
  try {
    // Get the latest ID from the table
    const res = await pool.query(
      `SELECT ${columnName} FROM ${tableName} ORDER BY ${columnName} DESC LIMIT 1`
    );

    if (res.rows.length === 0) {
      // If table is empty, start at 001
      return `${prefix}001`;
    }

    const lastId = res.rows[0][columnName]; // e.g., 'STU002'
    const match = lastId.match(/(\d+)$/);   // Extract the numbers at the end
    
    if (!match) return `${prefix}001`;
    
    const nextNum = parseInt(match[0], 10) + 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`; // e.g., STU003
    
  } catch (error) {
    console.error('ID Generation Error:', error);
    // Fallback to timestamp if something goes wrong
    return `${prefix}${Date.now()}`; 
  }
};

module.exports = generateId;