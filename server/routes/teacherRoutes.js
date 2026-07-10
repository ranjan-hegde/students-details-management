const express = require('express');
const router = express.Router();
const {
  createTeacher,
  getAllTeachers,
  getNextTeacherId,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} = require('../controllers/teacherController');

// GET /api/teachers/next-id — must be defined BEFORE /:id to avoid conflicts
router.get('/next-id', getNextTeacherId);

// POST   /api/teachers     — Create a new teacher
// GET    /api/teachers     — List all teachers (with search, pagination)
router.route('/').post(createTeacher).get(getAllTeachers);

// GET    /api/teachers/:id — Get single teacher
// PUT    /api/teachers/:id — Update teacher
// DELETE /api/teachers/:id — Soft delete (set status to inactive)
router.route('/:id').get(getTeacherById).put(updateTeacher).delete(deleteTeacher);

module.exports = router;
