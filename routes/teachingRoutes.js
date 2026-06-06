const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getTeachings, assignCourse, deleteTeaching } = require('../controllers/teachingController');

router.route('/').get(protect, getTeachings).post(protect, adminOnly, assignCourse);
router.route('/:id').delete(protect, adminOnly, deleteTeaching);
module.exports = router;