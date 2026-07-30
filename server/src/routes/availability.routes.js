const express = require('express');
const router = express.Router();
const availabilityModel = require('../models/availability.model');

router.get('/appointments/availability', async (req, res) => {
  try {
    const { month } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM.' });
    }

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: 'Month must be between 01 and 12.' });
    }

    const data = await availabilityModel.getMonthlyAvailability(year, monthNum);
    res.status(200).json({
      message: 'Availability retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/appointments/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const data = await availabilityModel.getDailyAvailability(date);
    res.status(200).json({
      message: 'Time slot availability retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
