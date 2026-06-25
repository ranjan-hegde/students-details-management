const express = require('express');
const router = express.Router();
const {
  createFeeRecord,
  getFeeRecord,
  updateFeeRecord,
} = require('../controllers/feeController');

// POST /api/fees        — Create a fee record for a student
// (no GET / on the base — fee records are fetched per student)
router.post('/', createFeeRecord);

// GET  /api/fees/:studentId — Get fee record with payments and calculated amounts
router.get('/:studentId', getFeeRecord);

// PUT  /api/fees/:id — Update the total fee
router.put('/:id', updateFeeRecord);

module.exports = router;
