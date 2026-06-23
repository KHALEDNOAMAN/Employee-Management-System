const express = require('express');
const router = express.Router();
const c = require('../controllers/reportController');
router.get('/summary', c.summary);
router.get('/departments', c.departmentDistribution);
router.get('/attendance', c.attendanceRate);
module.exports = router;
