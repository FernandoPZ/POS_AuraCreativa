const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const protect = require('../middlewares/authMiddleware');

router.get('/', protect, usuariosController.getUsuarios);
router.get('/:id', protect, usuariosController.getUsuarioById);
router.post('/', protect, usuariosController.createUsuario);
router.put('/:id', protect, usuariosController.updateUsuario);
router.delete('/:id', protect, usuariosController.deleteUsuario);

module.exports = router;