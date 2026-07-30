const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many requests. Try again later.' },
});

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL === '*' ? '*' : (process.env.CLIENT_URL || 'http://localhost:5173'),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// app.use(express.json());
app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return next();
  }
  express.json()(req, res, next);
});

// Routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);

const availabilityRoutes = require('./routes/availability.routes');
app.use('/api', availabilityRoutes);

const appointmentRoutes = require('./routes/appointment.routes');
app.use('/api/appointments', appointmentRoutes);

const patientRoutes = require('./routes/patient.routes');
app.use('/api/patients', patientRoutes);

const serviceRoutes = require('./routes/service.routes');
app.use('/api/services', serviceRoutes);

const publicRoutes = require('./routes/public.routes');
app.use('/api/public', publicRoutes);

const auditRoutes = require('./routes/audit.routes');
app.use('/api/audit-logs', auditRoutes);

const statsRoutes = require('./routes/stats.routes');
app.use('/api/stats', statsRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Stellars Dental API is running' });
});

// Database test route — disabled in production
if (process.env.NODE_ENV !== 'production') {
  app.get('/test-db', async (req, res) => {
    const { supabase } = require('./config/supabase');
    const { data, error } = await supabase.from('services').select('*');
    if (error) return res.status(500).json({ message: 'Internal server error' });
    res.json({ message: 'Database connected', data });
  });
}

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