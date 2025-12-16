const nodemailer = require('nodemailer');

let transporter = null;

const createTransporter = () => {
  // Priority 1: Use SendGrid (works on Render)
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }
  
  // Priority 2: Use Gmail (for local development only)
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }
  
  return null;
};

// Initialize transporter
transporter = createTransporter();

const sendOTP = async (email, otp) => {
  try {
    // Ensure transporter exists
    if (!transporter) {
      transporter = createTransporter();
      if (!transporter) {
        console.error("Email configuration missing: No email service configured (SENDGRID_API_KEY or GMAIL_USER/GMAIL_PASS).");
        return { success: false, error: "Server email configuration is missing. Please contact administrator." };
      }
    }

    // Use the authenticated user as the sender
    const senderEmail = process.env.SENDGRID_API_KEY 
      ? process.env.SENDGRID_FROM_EMAIL || 'noreply@meditrackng.com'
      : process.env.GMAIL_USER;
    
    const info = await transporter.sendMail({
      from: `"MediTRACKNG" <${senderEmail}>`, // sender address
      replyTo: "walkertech001@gmail.com", // reply address
      to: email, // list of receivers
      subject: "Your Verification Code", // Subject line
      text: `Your verification code is: ${otp}. It expires in 10 minutes.`, // plain text body
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">MediTRACKNG Verification</h2>
          <p>Thank you for registering. Please use the following OTP to verify your account:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #1e40af; margin: 20px 0;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `, // html body
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending email: ", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTP };
