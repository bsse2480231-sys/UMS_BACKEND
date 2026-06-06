const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getClassrooms, createClassroom, updateClassroom, deleteClassroom } = require('../controllers/classroomController');

router.route('/').get(protect, getClassrooms).post(protect, adminOnly, createClassroom);
router.route('/:id').put(protect, adminOnly, updateClassroom).delete(protect, adminOnly, deleteClassroom);
module.exports = router;