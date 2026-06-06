const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
// Import respective controllers here...
const { getExams, createExam, updateExam, deleteExam } = require('../controllers/examController')


router.route('/').get(protect, getExams).post(protect, adminOnly, createExam);
router.route('/:id').put(protect, adminOnly, updateExam).delete(protect, adminOnly, deleteExam);
module.exports = router;