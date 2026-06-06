const express = require('express');
const router = express.Router();
const { login, forgotPassword, getMe, getMyCourses, getMyFees,getMyAttendance,getMyLibrary } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
// const { login, forgotPassword } = require('../controllers/authController');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getMe);
router.get('/me/courses', protect, getMyCourses);
router.get('/me/fees', protect, getMyFees);
router.get('/me/attendance', protect, getMyAttendance); 
router.get('/me/library', protect, getMyLibrary);       
module.exports = router;