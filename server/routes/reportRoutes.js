const express = require('express');
const router = express.Router();
const {
  getAttendanceReport,
  getFeeReport,
  getResultReport,
  getStudentStrengthReport,
} = require('../controllers/reportController');

router.get('/attendance', getAttendanceReport);
router.get('/fees', getFeeReport);
router.get('/results', getResultReport);
router.get('/strength', getStudentStrengthReport);

module.exports = router;
