const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getNotices, createNotice, deleteNotice } = require('../controllers/noticeController');

// Anyone logged in can GET notices, but only Admins can POST or DELETE
router.route('/').get(protect, getNotices).post(protect, adminOnly, createNotice);
router.route('/:id').delete(protect, adminOnly, deleteNotice);

module.exports = router;