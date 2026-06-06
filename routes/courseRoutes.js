const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getCourses, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');

router.route('/').get(protect, getCourses).post(protect, adminOnly, createCourse);
router.route('/:id').put(protect, adminOnly, updateCourse).delete(protect, adminOnly, deleteCourse);
module.exports = router;