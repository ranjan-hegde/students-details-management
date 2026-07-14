const express = require('express');
const router = express.Router();
const {
  createExamSchedule,
  getExamSchedules,
  getExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
} = require('../controllers/examScheduleController');

router.post('/', createExamSchedule);
router.get('/', getExamSchedules);
router.get('/:id', getExamSchedule);
router.put('/:id', updateExamSchedule);
router.delete('/:id', deleteExamSchedule);

module.exports = router;
