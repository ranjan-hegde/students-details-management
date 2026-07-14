const express = require('express');
const router = express.Router();
const {
  createNotice,
  getNotices,
  getActiveNotices,
  getNotice,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');

router.post('/', createNotice);
router.get('/', getNotices);
router.get('/active', getActiveNotices);
router.get('/:id', getNotice);
router.put('/:id', updateNotice);
router.delete('/:id', deleteNotice);

module.exports = router;
