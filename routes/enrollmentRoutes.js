const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getEnrollments, createEnrollment, updateEnrollment, deleteEnrollment } = require('../controllers/enrollmentController');

router.route('/').get(protect, getEnrollments).post(protect, adminOnly, createEnrollment);
router.route('/:id').put(protect, adminOnly, updateEnrollment).delete(protect, adminOnly, deleteEnrollment);
module.exports = router;