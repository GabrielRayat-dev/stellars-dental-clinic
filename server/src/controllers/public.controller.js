const publicModel = require('../models/public.model');

// ─── FAQs ───────────────────────────────────────────

// Get active FAQs — public
const getActiveFaqs = async (req, res) => {
  try {
    const data = await publicModel.getActiveFaqs();
    res.status(200).json({
      message: 'FAQs retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all FAQs — admin
const getAllFaqs = async (req, res) => {
  try {
    const data = await publicModel.getAllFaqs();
    res.status(200).json({
      message: 'FAQs retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create FAQ — admin
const createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const data = await publicModel.createFaq(question, answer);
    res.status(201).json({
      message: 'FAQ created successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update FAQ — admin
const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }

    const { question, answer, is_active } = req.body;
    const data = await publicModel.updateFaq(id, { question, answer, is_active });
    res.status(200).json({
      message: 'FAQ updated successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete FAQ — admin
const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await publicModel.deleteFaq(id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Clinic Information ──────────────────────────────

// Get clinic information — public
const getClinicInformation = async (req, res) => {
  try {
    const data = await publicModel.getClinicInformation();
    res.status(200).json({
      message: 'Clinic information retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get public dentist list — public
const getPublicDentists = async (req, res) => {
  try {
    const data = await publicModel.getPublicDentists();
    res.status(200).json({
      message: 'Dentists retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update clinic information — admin
const updateClinicInformation = async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }

    const { name, address, phone, email, operating_hours, description } = req.body;
    const data = await publicModel.updateClinicInformation({ name, address, phone, email, operating_hours, description });
    res.status(200).json({
      message: 'Clinic information updated successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getActiveFaqs,
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getClinicInformation,
  updateClinicInformation,
  getPublicDentists,
};