require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log('Testing Email Configuration...');
  console.log('User:', process.env.BREVO_SMTP_USER);
  // Don't log the full password for security, just length
  console.log('Password Length:', process.env.BREVO_SMTP_PASS ? process.env.BREVO_SMTP_PASS.length : 0);

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  });

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('✅ SMTP Connection Successful');

    // Send test email
    // REPLACE THIS WITH YOUR ACTUAL EMAIL TO TEST RECEIPT
    const testRecipient = process.env.BREVO_SMTP_USER; 
    
    console.log(`Attempting to send test email to ${testRecipient}...`);
    
    const info = await transporter.sendMail({
      from: process.env.BREVO_SMTP_USER, // Use the authenticated user as sender to avoid permission issues
      to: testRecipient,
      subject: "MediTRACKNG SMTP Test",
      text: "If you receive this, your email configuration is working correctly.",
      html: "<b>If you receive this, your email configuration is working correctly.</b>",
    });

    console.log("✅ Message sent: %s", info.messageId);
    console.log("Check your inbox (and spam folder) for the test email.");
  } catch (error) {
    console.error("❌ Error:", error);
    
    if (error.code === 'EAUTH') {
      console.error("Authentication failed. Please check your BREVO_SMTP_USER and BREVO_SMTP_PASS.");
    }
  }
};

testEmail();
