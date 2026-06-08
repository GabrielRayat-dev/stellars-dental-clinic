const adminModel = require('../models/admin.model');

// Get all staff
const getAllStaff = async (req, res) => {
  try {
    const data = await adminModel.getAllStaff();
    res.status(200).json({
      message: 'Staff retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single staff
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await adminModel.getStaffById(id);

    if (!data) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.status(200).json({
      message: 'Staff retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create staff
const createStaff = async (req, res) => {
  try {
    const { email, password, ...profileData } = req.body;

    if (!email || !password || !profileData.name || !profileData.role) {
      return res.status(400).json({ message: 'Email, password, name, and role are required' });
    }

    if (!['dentist', 'assistant'].includes(profileData.role)) {
      return res.status(400).json({ message: 'Role must be dentist or assistant' });
    }
    const data = await adminModel.createStaff(email, password, profileData);
    
    res.status(201).json({
      message: 'Staff created successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, details: error });
  }
};

// Update staff
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const profileData = req.body;

    if (Object.keys(profileData).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }

    const data = await adminModel.updateStaff(id, profileData);
    res.status(200).json({
      message: 'Staff updated successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete staff
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await adminModel.deleteStaff(id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
};