const express = require('express');
const router = express.Router();
const c = require('../controllers/departmentController');
router.get('/', c.getAll);
router.get('/tree', c.getTree);
router.get('/:id', c.getById);
router.post('/', c.create);
router.put('/:id', c.update);
module.exports = router;
