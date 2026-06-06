const pool = require('../config/db');
const generateId = require('../utils/generateId');

exports.getClassrooms = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Classroom');
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.createClassroom = async (req, res) => {
  const { room_number, building_name, capacity, type } = req.body;
  try {
    const classroom_id = await generateId('ROOM', 'Classroom', 'classroom_id');
    const result = await pool.query(
      'INSERT INTO Classroom (classroom_id, room_number, building_name, capacity, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [classroom_id, room_number, building_name, capacity, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
};

exports.updateClassroom = async (req, res) => {
  const { room_number, building_name, capacity, type } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Classroom SET room_number=$1, building_name=$2, capacity=$3, type=$4 WHERE classroom_id=$5 RETURNING *',
      [room_number, building_name, capacity, type, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.deleteClassroom = async (req, res) => {
  try {
    await pool.query('DELETE FROM Classroom WHERE classroom_id=$1', [req.params.id]);
    res.json({ message: 'Classroom deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};