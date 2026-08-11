const { z } = require('zod');

// ─── Primitives ────────────────────────────────────────────────
const email = z.email().trim().toLowerCase().max(254);
const name = z.string().trim().min(1).max(100);
const phone = z.string().trim().min(7).max(20);
const passwordMin8 = z.string().min(8).max(128);
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const otpCode = z.string().regex(/^\d{6}$/);
const idParam = z.string().trim().min(1).max(64);
const text = (min, max) => z.string().trim().min(min).max(max);
const money = z.union([z.number().finite().nonnegative(), z.string().trim().max(20)]).optional();

// ─── Auth ──────────────────────────────────────────────────────
const authSchemas = {
  login: {
    body: z.object({
      email,
      password: z.string().min(1).max(128),
    }),
  },
  changePassword: {
    body: z.object({
      current_password: z.string().min(1).max(128).optional(),
      new_password: passwordMin8,
    }),
  },
  forgotPassword: {
    body: z.object({ email }),
  },
  resetPassword: {
    body: z.object({
      email,
      otp: otpCode,
      new_password: passwordMin8,
    }),
  },
  updateProfile: {
    body: z.object({
      new_email: email.optional(),
      name: name.optional(),
      phone_number: phone.optional(),
      specialization: text(1, 200).optional(),
    }),
  },
};

// ─── Appointments ──────────────────────────────────────────────
const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];

const appointmentSchemas = {
  create: {
    body: z.object({
      patient_name: name,
      phone_number: phone,
      service_id: idParam,
      preferred_date: dateString,
      preferred_time: z.enum(TIME_SLOTS),
    }),
  },
  statusCheck: {
    body: z.object({
      patient_name: name,
      phone_number: phone,
    }),
  },
  reject: {
    body: z.object({
      rejected_reason: text(1, 500),
    }),
  },
  id: { params: z.object({ id: idParam }) },
};

// ─── Admin / Staff ─────────────────────────────────────────────
const adminSchemas = {
  createStaff: {
    body: z.object({
      email,
      password: passwordMin8,
      name,
      role: z.enum(['dentist', 'assistant']),
      specialization: text(1, 200).optional(),
      phone_number: phone.optional(),
      receive_emails: z.boolean().optional(),
      is_active: z.boolean().optional(),
    }),
  },
  updateStaff: {
    body: z.object({
      name: name.optional(),
      role: z.enum(['dentist', 'assistant']).optional(),
      specialization: text(1, 200).optional(),
      phone_number: phone.optional(),
      receive_emails: z.boolean().optional(),
      is_active: z.boolean().optional(),
    }),
  },
  id: { params: z.object({ id: idParam }) },
};

// ─── Services ──────────────────────────────────────────────────
const serviceSchemas = {
  create: {
    body: z.object({
      name: text(1, 100),
      description: text(1, 1000).optional(),
    }),
  },
  update: {
    body: z.object({
      name: text(1, 100).optional(),
      description: text(1, 1000).optional(),
      price: money,
      is_active: z.boolean().optional(),
    }),
  },
  toggle: {
    body: z.object({ is_active: z.boolean() }),
  },
  id: { params: z.object({ id: idParam }) },
};

// ─── Patients ──────────────────────────────────────────────────
const ageField = z.union([z.number().int().nonnegative(), z.string().trim().max(3)]);

const patientSchemas = {
  create: {
    body: z.object({
      name,
      age: ageField,
      birthday: dateString,
      sex: text(1, 20),
      civil_status: text(1, 30),
      address: text(1, 255),
      phone_number: phone,
      emergency_contact: phone,
      blood_type: text(1, 10),
    }),
  },
  update: {
    body: z.object({
      name: name.optional(),
      age: ageField.optional(),
      birthday: dateString.optional(),
      sex: text(1, 20).optional(),
      civil_status: text(1, 30).optional(),
      address: text(1, 255).optional(),
      phone_number: phone.optional(),
      emergency_contact: phone.optional(),
      blood_type: text(1, 10).optional(),
    }),
  },
  addDiagnosis: {
    body: z.object({
      date: dateString,
      time: z.string().trim().min(1).max(10),
      diagnosis: text(1, 2000),
      treatment: text(1, 2000),
      chief_complaint: idParam.optional(),
      amount_paid: money,
      balance: money,
    }),
  },
  updateDiagnosis: {
    body: z.object({
      date: dateString.optional(),
      time: z.string().trim().min(1).max(10).optional(),
      diagnosis: text(1, 2000).optional(),
      treatment: text(1, 2000).optional(),
      chief_complaint: idParam.optional(),
      amount_paid: money,
      balance: money,
    }),
  },
  id: { params: z.object({ id: idParam }) },
  idRecord: { params: z.object({ id: idParam, recordId: idParam }) },
  idImage: { params: z.object({ id: idParam, imageId: idParam }) },
};

// ─── Public (FAQs, clinic info) ────────────────────────────────
const publicSchemas = {
  createFaq: {
    body: z.object({
      question: text(1, 500),
      answer: text(1, 5000),
    }),
  },
  updateFaq: {
    body: z.object({
      question: text(1, 500).optional(),
      answer: text(1, 5000).optional(),
      is_active: z.boolean().optional(),
    }),
  },
  updateClinic: {
    body: z.object({
      name: text(1, 200).optional(),
      address: text(1, 500).optional(),
      phone: text(1, 30).optional(),
      email: z.union([email, z.literal('')]).optional(),
      operating_hours: text(1, 500).optional(),
      description: text(1, 5000).optional(),
    }),
  },
  id: { params: z.object({ id: idParam }) },
};

// ─── Availability ──────────────────────────────────────────────
const availabilitySchemas = {
  month: {
    query: z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }),
  },
  date: {
    params: z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
  },
};

module.exports = {
  authSchemas,
  appointmentSchemas,
  adminSchemas,
  serviceSchemas,
  patientSchemas,
  publicSchemas,
  availabilitySchemas,
};
