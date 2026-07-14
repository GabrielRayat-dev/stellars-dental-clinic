const express = require('express');
const router = express.Router();
const { getStats } = require('../models/stats.model');
const { authenticate, authorizeAdminOrDentist } = require('../middlewares/auth');

router.get('/', authenticate, authorizeAdminOrDentist, async (req, res) => {
  try {
    const data = await getStats();
    res.status(200).json({
      message: 'Stats retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
