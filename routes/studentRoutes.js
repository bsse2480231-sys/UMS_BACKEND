const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getStudents, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');

router.route('/').get(protect, getStudents).post(protect, adminOnly, createStudent);
router.route('/:id').put(protect, adminOnly, updateStudent).delete(protect, adminOnly, deleteStudent);

module.exports = router;