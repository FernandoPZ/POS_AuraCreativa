const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const protect = require('../middlewares/authMiddleware');

router.get('/proveedores', protect, proveedorController.getProveedores);
router.get('/proveedores/:id', protect, proveedorController.getProveedorById);
router.post('/proveedores', protect, proveedorController.createProveedor);
router.put('/proveedores/:id', protect, proveedorController.updateProveedor);
router.delete('/proveedores/:id', protect, proveedorController.deleteProveedor);

module.exports = router;