const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getFees, createFee, updateFee, deleteFee } = require('../controllers/feeController')

router.route('/').get(protect, getFees).post(protect, adminOnly, createFee);
router.route('/:id').put(protect, adminOnly, updateFee).delete(protect, adminOnly, deleteFee);
module.exports = router;