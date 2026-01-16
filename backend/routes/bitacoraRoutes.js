const express = require('express');
const router = express.Router();
const bitacoraController = require('../controllers/bitacoraController');
const protect = require('../middlewares/authMiddleware');

router.get('/', protect, bitacoraController.getBitacora);

module.exports = router;