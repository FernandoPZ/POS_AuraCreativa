const express = require('express');
const router = express.Router();
const puntosController = require('../controllers/puntosEntregaController');
const protect = require('../middlewares/authMiddleware');

router.get('/', protect, puntosController.getPuntos);
router.post('/', protect, puntosController.createPunto);
router.put('/:id', protect, puntosController.updatePunto);
router.delete('/:id', protect, puntosController.deletePunto);

module.exports = router;