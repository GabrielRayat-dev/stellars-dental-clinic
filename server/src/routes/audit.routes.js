const express = require('express');
const router = express.Router();
const auditModel = require('../models/audit.model');
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const data = await auditModel.getAllLogs(req.profile);
    res.status(200).json({
      message: 'Audit logs retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;