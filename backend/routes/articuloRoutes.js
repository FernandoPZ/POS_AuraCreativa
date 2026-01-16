const express = require('express');
const router = express.Router();
const articuloController = require('../controllers/articuloController');
const protect = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// --- CONFIGURACIÓN DE MULTER (Subida de Imágenes) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'art-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/articulos/:id', protect, articuloController.getArticuloById);
router.get('/articulos', protect, articuloController.getArticulos);
router.post('/articulos', protect, upload.single('Imagen'), articuloController.createArticulo);
router.put('/articulos/:id', protect, upload.single('Imagen'), articuloController.updateArticulo);
router.delete('/articulos/:id', protect, articuloController.deleteArticulo);

module.exports = router;