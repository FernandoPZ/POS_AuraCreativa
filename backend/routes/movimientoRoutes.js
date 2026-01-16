const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');
const protect = require('../middlewares/authMiddleware');

router.post('/movimientos/entrada', protect, movimientoController.entradaInsumo);
router.post('/movimientos/salida', protect, movimientoController.salidaInsumo);
router.get('/movimientos', protect, movimientoController.getHistorialMovimientos);

module.exports = router;