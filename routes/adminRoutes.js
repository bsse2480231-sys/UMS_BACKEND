const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin } = require('../controllers/adminController');

// All admin routes are restricted to Admins only
router.route('/')
  .get(protect, adminOnly, getAdmins)
  .post(protect, adminOnly, createAdmin);

router.route('/:id')
  .get(protect, adminOnly, getAdminById)
  .put(protect, adminOnly, updateAdmin)
  .delete(protect, adminOnly, deleteAdmin);

module.exports = router;