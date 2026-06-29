const express = require('express');
const router = express.Router();
const auditModel = require('../models/audit.model');
const { authenticate, authorizeAdminOrDentist } = require('../middlewares/auth');

router.get('/', authenticate, authorizeAdminOrDentist, async (req, res) => {
  try {
    const data = await auditModel.getAllLogs();
    res.status(200).json({
      message: 'Audit logs retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;