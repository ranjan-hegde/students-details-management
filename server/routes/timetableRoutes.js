const express = require('express');
const router = express.Router();
const {
  createOrUpdateEntry,
  bulkSaveTimetable,
  getTimetableByClass,
  getTimetableByTeacher,
  deleteEntry,
} = require('../controllers/timetableController');

// POST /api/timetable/bulk — Bulk save timetable for a class+section
router.post('/bulk', bulkSaveTimetable);

// GET  /api/timetable/teacher/:teacherId — Get timetable entries for a teacher
router.get('/teacher/:teacherId', getTimetableByTeacher);

// POST /api/timetable — Create or update a single timetable entry
// GET  /api/timetable — Get timetable by class+section (query params)

router.route('/').post(createOrUpdateEntry).get(getTimetableByClass);

// DELETE /api/timetable/:id — Delete a timetable entry
router.delete('/:id', deleteEntry);

module.exports = router;
