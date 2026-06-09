const serviceModel = require('../models/service.model');

// Get all services — dentist only
const getAllServices = async (req, res) => {
  try {
    const data = await serviceModel.getAllServices();
    res.status(200).json({
      message: 'Services retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active services — public and staff
const getActiveServices = async (req, res) => {
  try {
    const data = await serviceModel.getActiveServices();
    res.status(200).json({
      message: 'Services retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create service — dentist only
const createService = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Service name is required' });
    }

    const data = await serviceModel.createService({ name, description });
    res.status(201).json({
      message: 'Service created successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update service — dentist only
const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }

    const data = await serviceModel.updateService(id, req.body);
    res.status(200).json({
      message: 'Service updated successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle service status — dentist only
const toggleServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined) {
      return res.status(400).json({ message: 'is_active field is required' });
    }

    const data = await serviceModel.toggleServiceStatus(id, is_active);
    res.status(200).json({
      message: `Service ${is_active ? 'activated' : 'deactivated'} successfully`,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllServices,
  getActiveServices,
  createService,
  updateService,
  toggleServiceStatus,
};