const express = require('express');
const router = express.Router();
const combosController = require('../controllers/combosController');
const protect = require('../middlewares/authMiddleware');

router.get('/', protect, combosController.getCombos);
router.get('/:id', protect, combosController.getComboById);
router.post('/', protect, combosController.createCombo);
router.put('/:id', protect, combosController.updateCombo);
router.delete('/:id', protect, combosController.deleteCombo);

module.exports = router;