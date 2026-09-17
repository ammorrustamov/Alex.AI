const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');
const Note = require('../models/Note');

exports.getLeads = async (req, res, next) => {
  try {
    const { priority, status, search, is_demo, limit, offset } = req.query;
    const leads = await Lead.findAll({
      priority,
      status,
      search,
      isDemo: is_demo,
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0
    });

    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (err) {
    next(err);
  }
};

exports.getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const conversations = await Conversation.findByLeadId(id);
    const notes = await Note.findByLeadId(id);

    res.json({
      success: true,
      data: {
        ...lead,
        conversations,
        notes
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createLead = async (req, res, next) => {
  try {
    const newLead = await Lead.create(req.body);
    res.status(201).json({
      success: true,
      data: newLead
    });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updated = await Lead.updateStatus(id, status);
    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.updateContacted = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_contacted } = req.body;

    const updated = await Lead.updateContacted(id, is_contacted);
    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.escalateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assigned_to, reason, urgency } = req.body;

    const updated = await Lead.escalate(id, {
      assignedTo: assigned_to,
      reason: reason || 'Customer requested human agent or complex HVAC issue',
      urgency: urgency || 'urgent'
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { author, note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const newNote = await Note.create(id, author, note);
    res.status(201).json({
      success: true,
      data: newNote
    });
  } catch (err) {
    next(err);
  }
};
