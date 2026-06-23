const express = require('express');
const router = express.Router();
const c = require('../controllers/attendanceController');
router.post('/check-in', c.checkIn);
router.post('/check-out', c.checkOut);
router.get('/employee/:employeeId', c.getByEmployee);
router.get('/daily', c.getDailySummary);
module.exports = router;
