const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER, // generated ethereal user
    pass: process.env.BREVO_SMTP_PASS, // generated ethereal password
  },
});

const sendOTP = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: '"MediTRACKNG" <no-reply@meditrackng.com>', // sender address
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
