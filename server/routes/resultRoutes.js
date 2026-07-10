const express = require('express');
const router = express.Router();
const {
  createResult,
  getResultsByStudent,
  getResultsByClass,
  updateResult,
  deleteResult,
} = require('../controllers/resultController');

// POST /api/results — Create or upsert a result
// GET  /api/results — Get results by class/section/examType/academicYear
router.route('/').post(createResult).get(getResultsByClass);

// GET /api/results/student/:studentId — Get all results for a student
router.get('/student/:studentId', getResultsByStudent);

// PUT    /api/results/:id — Update a result
// DELETE /api/results/:id — Delete a result
router.route('/:id').put(updateResult).delete(deleteResult);

module.exports = router;
