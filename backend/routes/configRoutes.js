const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const protect = require('../middlewares/authMiddleware');

router.get('/', protect, configController.getConfig);
router.put('/', protect, configController.updateConfig);

module.exports = router;