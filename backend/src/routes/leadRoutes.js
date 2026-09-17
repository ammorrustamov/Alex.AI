const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

router.get('/', leadController.getLeads);
router.get('/:id', leadController.getLeadById);
router.post('/', leadController.createLead);
router.patch('/:id/status', leadController.updateStatus);
router.patch('/:id/contacted', leadController.updateContacted);
router.post('/:id/escalate', leadController.escalateLead);
router.post('/:id/notes', leadController.addNote);

module.exports = router;
