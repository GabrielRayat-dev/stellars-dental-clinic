const { BrevoClient } = require('@getbrevo/brevo');

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendOTPEmail = async (toEmail, toName, otp) => {
  await client.transactionalEmails.sendTransacEmail({
    sender: {
      name: 'Stellars Dental Clinic',
      email: 'gabrielrayatofficial@gmail.com',
    },
    to: [{ email: toEmail, name: toName }],
    subject: 'Your Password Reset OTP',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
        <h2>Stellars Dental Clinic</h2>
        <p>You requested a password reset. Use the OTP below:</p>
        <h1 style="letter-spacing: 8px; color: #2d6a4f;">${otp}</h1>
        <p>This OTP expires in <strong>5 minutes</strong>.</p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };