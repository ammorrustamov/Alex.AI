const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/message', chatController.sendMessage);
router.post('/reset', chatController.resetChat);

module.exports = router;
