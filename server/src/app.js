const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const appointmentRoutes = require('./routes/appointment.routes');
app.use('/api/appointments', appointmentRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Stellars Dental API is running' });
});

// Database test route
app.get('/test-db', async (req, res) => {
  const { supabase } = require('./config/supabase');
  const { data, error } = await supabase.from('services').select('*');
  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: 'Database connected', data });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;