const adminModel = require('../models/admin.model');
const auditModel = require('../models/audit.model');

// Get all staff
const getAllStaff = async (req, res) => {
  try {
    const data = await adminModel.getAllStaff();
    res.status(200).json({
      message: 'Staff retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
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
    res.status(500).json({ message: 'Internal server error' });
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

    await auditModel.logAction({
      actorId: req.profile.id,
      actorName: req.profile.name,
      actorRole: req.profile.role,
      action: 'create',
      resourceType: 'staff',
      resourceId: data.id,
    });

    res.status(201).json({
      message: 'Staff created successfully',
      data,
    });
  } catch (error) {
    console.error('createStaff failed:', error);
    res.status(500).json({ message: error?.message || 'Internal server error' });
  }
};

// Update staff
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, is_active, specialization, phone_number } = req.body;

    // Prevent admin from deactivating themselves
    if (id === req.profile.id && is_active === false) {
      return res.status(400).json({ message: 'Admin cannot deactivate itself' });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }

    const data = await adminModel.updateStaff(id, { name, role, is_active, specialization, phone_number });

    await auditModel.logAction({
      actorId: req.profile.id,
      actorName: req.profile.name,
      actorRole: req.profile.role,
      action: 'update',
      resourceType: 'staff',
      resourceId: id,
    });

    res.status(200).json({
      message: 'Staff updated successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete staff
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.profile.id) {
      return res.status(400).json({ message: 'Admin cannot delete itself' });
    }

    const data = await adminModel.deleteStaff(id);

    await auditModel.logAction({
      actorId: req.profile.id,
      actorName: req.profile.name,
      actorRole: req.profile.role,
      action: 'delete',
      resourceType: 'staff',
      resourceId: id,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
};