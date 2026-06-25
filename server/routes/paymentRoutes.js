const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPaymentHistory,
} = require('../controllers/paymentController');

// POST /api/payments           — Record a new payment (auto-generates receipt number)
router.post('/', createPayment);

// GET  /api/payments/:studentId — Get payment history for a student
router.get('/:studentId', getPaymentHistory);

module.exports = router;
