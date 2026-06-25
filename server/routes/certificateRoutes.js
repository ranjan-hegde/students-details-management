const express = require('express');
const router = express.Router();
const {
  generateBonafide,
  generateTC,
  getStudentCertificates,
} = require('../controllers/certificateController');

// POST /api/certificates/bonafide/:studentId — Generate bonafide certificate
router.post('/bonafide/:studentId', generateBonafide);

// POST /api/certificates/tc/:studentId — Generate Transfer Certificate
router.post('/tc/:studentId', generateTC);

// GET  /api/certificates/:studentId — List all certificates for a student
router.get('/:studentId', getStudentCertificates);

module.exports = router;
