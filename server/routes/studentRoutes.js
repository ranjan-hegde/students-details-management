const express = require('express');
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getNextAdmissionNumber,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

// GET /api/students/next-admission-number — must be defined BEFORE /:id to avoid conflicts
router.get('/next-admission-number', getNextAdmissionNumber);

// POST   /api/students     — Create a new student
// GET    /api/students     — List all students (with search, filter, pagination)
router.route('/').post(createStudent).get(getAllStudents);

// GET    /api/students/:id — Get single student (with documents)
// PUT    /api/students/:id — Update student
// DELETE /api/students/:id — Soft delete (set status to inactive)
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);

module.exports = router;
