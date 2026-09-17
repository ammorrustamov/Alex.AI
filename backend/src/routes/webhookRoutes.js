const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Support both URL-encoded forms from Twilio and JSON
router.use(express.urlencoded({ extended: true }));

// Twilio Voice endpoints
router.post('/twilio/voice', webhookController.handleTwilioVoice);
router.post('/twilio/voice/process', webhookController.handleTwilioVoiceProcess);

// Twilio SMS endpoint
router.post('/twilio/sms', webhookController.handleTwilioSms);

module.exports = router;
