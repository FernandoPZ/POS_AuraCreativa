const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const protect = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', configController.getConfig);
router.put('/', protect, upload.single('Logo'), configController.updateConfig);

module.exports = router;