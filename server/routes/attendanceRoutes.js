const express = require('express');
const router = express.Router();
const { markAttendance, getAttendanceByDate, getStudentAttendance, getClassAttendanceReport, updateAttendance } = require('../controllers/attendanceController');

router.post('/', markAttendance);
router.get('/', getAttendanceByDate);
router.get('/student/:studentId', getStudentAttendance);
router.get('/report', getClassAttendanceReport);
router.put('/:id', updateAttendance);

module.exports = router;
