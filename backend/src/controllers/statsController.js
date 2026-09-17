const Lead = require('../models/Lead');
const Escalation = require('../models/Escalation');

exports.getStats = async (req, res, next) => {
  try {
    const stats = await Lead.getStats();
    const escalations = await Escalation.findAll();

    res.json({
      success: true,
      data: {
        ...stats,
        recentEscalations: escalations.slice(0, 5)
      }
    });
  } catch (err) {
    next(err);
  }
};
