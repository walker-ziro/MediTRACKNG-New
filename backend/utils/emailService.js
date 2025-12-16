const nodemailer = require('nodemailer');

let transporter = null;

const createTransporter = () => {
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
        console.error("Email configuration missing: GMAIL_USER or GMAIL_PASS not set.");
        return false;
      }
    }

    // Use the authenticated user as the sender
    const senderEmail = process.env.GMAIL_USER;
    
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
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};

module.exports = { sendOTP };
