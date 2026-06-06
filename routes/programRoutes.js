const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getPrograms, createProgram, updateProgram, deleteProgram } = require('../controllers/programController');

router.route('/').get(protect, getPrograms).post(protect, adminOnly, createProgram);
router.route('/:id').put(protect, adminOnly, updateProgram).delete(protect, adminOnly, deleteProgram);
module.exports = router;