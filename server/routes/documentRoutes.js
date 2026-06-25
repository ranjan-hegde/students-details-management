const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadDocuments,
  getStudentDocuments,
  deleteDocument,
} = require('../controllers/documentController');

// POST   /api/documents/upload/:studentId — Upload multiple files for a student
router.post('/upload/:studentId', upload.array('files', 10), uploadDocuments);

// GET    /api/documents/:studentId — Get all documents for a student
router.get('/:studentId', getStudentDocuments);

// DELETE /api/documents/:id — Delete a document and remove the file
router.delete('/:id', deleteDocument);

module.exports = router;
