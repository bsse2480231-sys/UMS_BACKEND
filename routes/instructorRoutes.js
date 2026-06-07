const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getInstructors, createInstructor, updateInstructor, deleteInstructor, getCourseStudents, submitAttendance, submitGrades } = require('../controllers/instructorController');

router.get('/course/:courseId/students', protect, getCourseStudents);
router.post('/attendance', protect, submitAttendance);
router.put('/grades', protect, submitGrades);
router.route('/').get(protect, getInstructors).post(protect, adminOnly, createInstructor);
router.route('/:id').put(protect, adminOnly, updateInstructor).delete(protect, adminOnly, deleteInstructor);

module.exports = router;