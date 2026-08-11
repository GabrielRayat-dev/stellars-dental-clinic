const express = require('express');
const router = express.Router();
const availabilityModel = require('../models/availability.model');
const validate = require('../middlewares/validate');
const { availabilitySchemas } = require('../validation/schemas');

router.get('/appointments/availability', validate(availabilitySchemas.month), async (req, res) => {
  try {
    const { month } = req.query;

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
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/appointments/availability/:date', validate(availabilitySchemas.date), async (req, res) => {
  try {
    const { date } = req.params;

    const data = await availabilityModel.getDailyAvailability(date);
    res.status(200).json({
      message: 'Time slot availability retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
