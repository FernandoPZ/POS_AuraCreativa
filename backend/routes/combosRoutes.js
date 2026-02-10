const express = require('express');
const router = express.Router();
const combosController = require('../controllers/combosController');
const protect = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', protect, combosController.getCombos);
router.get('/:id', protect, combosController.getComboById);
router.post('/', protect, upload.single('Imagen'), combosController.createCombo);
router.put('/:id', protect, upload.single('Imagen'), combosController.updateCombo);
router.delete('/:id', protect, combosController.deleteCombo);

module.exports = router;