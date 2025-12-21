const nodemailer = require('nodemailer');
const axios = require('axios');

let transporter = null;

const createTransporter = () => {
  // Priority 1: Use Brevo (formerly Sendinblue) - works on Render
  if (process.env.BREVO_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: {
        user: process.env.BREVO_SMTP_USER || process.env.BREVO_USER,
        pass: process.env.BREVO_API_KEY,
      },
    });
  }

  // Priority 2: Use SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }
  
  // Priority 3: Use Gmail (for local development only)
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
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
    const senderEmail = process.env.BREVO_API_KEY
      ? process.env.BREVO_FROM_EMAIL || 'noreply@meditrackng.com'
      : process.env.SENDGRID_API_KEY 
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

const sendPasswordReset = async (email, resetToken, firstName, userType) => {
  try {
    console.log(`sendPasswordReset called with: email=${email}, userType=${userType}, firstName=${firstName}`);
    
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/${userType}/reset-password?token=${resetToken}`;
    
    console.log(`Reset URL: ${resetUrl}`);

    // Priority 1: Use Brevo REST API (works on all platforms including Render free tier)
    // NOTE: BREVO_API_KEY must be the REST API key, NOT the SMTP password (xsmtpsib-)
    // Get it from: Brevo Dashboard → Your Name → SMTP & API → API Keys tab
    if (process.env.BREVO_API_KEY && !process.env.BREVO_API_KEY.startsWith('xsmtpsib-')) {
      console.log('Using Brevo REST API to send password reset email');
      
      try {
        const response = await axios.post(
          'https://api.brevo.com/v3/smtp/email',
          {
            sender: {
              name: 'MediTRACKNG',
              email: process.env.BREVO_FROM_EMAIL || 'noreply@meditrackng.com'
            },
            to: [{ email: email }],
            subject: 'Password Reset Request',
            htmlContent: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #2563eb;">Password Reset Request</h2>
                <p>Hi ${firstName || 'there'},</p>
                <p>You requested to reset your password. Click the button below to reset it:</p>
                <div style="margin: 30px 0;">
                  <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; word-break: break-all;">${resetUrl}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
              </div>
            `
          },
          {
            headers: {
              'accept': 'application/json',
              'api-key': process.env.BREVO_API_KEY,
              'content-type': 'application/json'
            }
          }
        );

        console.log('Password reset email sent via Brevo API:', response.data.messageId);
        return { success: true };
      } catch (apiError) {
        console.error('Brevo API error:', apiError.response?.data || apiError.message);
        console.error('NOTE: Make sure BREVO_API_KEY is the REST API key, not SMTP password');
        // Fall through to SMTP fallback
      }
    } else if (process.env.BREVO_API_KEY?.startsWith('xsmtpsib-')) {
      console.warn('BREVO_API_KEY appears to be an SMTP password, not REST API key. Skipping API method.');
    }

    // Priority 2: Fall back to SMTP (for local development)
    console.log('Falling back to SMTP for password reset email');
    if (!transporter) {
      console.log('Creating new transporter...');
      transporter = createTransporter();
      if (!transporter) {
        console.error("Email configuration missing.");
        return { success: false, error: "Server email configuration is missing." };
      }
      console.log('Transporter created successfully');
    }

    const senderEmail = process.env.BREVO_API_KEY
      ? process.env.BREVO_FROM_EMAIL || 'noreply@meditrackng.com'
      : process.env.SENDGRID_API_KEY 
      ? process.env.SENDGRID_FROM_EMAIL || 'noreply@meditrackng.com'
      : process.env.GMAIL_USER;
    
    console.log(`Sending password reset email from ${senderEmail} to ${email}`);
    
    const info = await transporter.sendMail({
      from: `"MediTRACKNG" <${senderEmail}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Hi ${firstName || 'there'},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        </div>
      `,
    });

    console.log("Password reset email sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email: ", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTP, sendPasswordReset };
